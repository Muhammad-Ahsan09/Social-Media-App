
const { pool } = require("../database.js");

// POST /journeys/:journey_id/entries
const createJourneyEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id } = req.params;
        const {
            title = null,
            content = null,
            entry_date,
            sort_order = 0,
        } = req.body;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        if (
            title !== null &&
            (typeof title !== "string" || title.length > 150)
        ) {
            return res.status(400).json({
                success: false,
                message: "Title must be a string of at most 150 characters",
            });
        }

        if (content !== null && typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Content must be a string",
            });
        }

        if (
            !Number.isInteger(sort_order) ||
            sort_order < -2147483648 ||
            sort_order > 2147483647
        ) {
            return res.status(400).json({
                success: false,
                message: "sort_order must be a valid integer",
            });
        }

        const [journeys] = await pool.query(
            `SELECT id FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        if (journeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO journey_entries
                (journey_id, user_id, title, content, entry_date, sort_order)
             VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)`,
            [
                journey_id,
                userId,
                title,
                content,
                entry_date || null,
                sort_order,
            ]
        );

        const [entries] = await pool.query(
            `SELECT *
             FROM journey_entries
             WHERE id = ? AND journey_id = ?`,
            [result.insertId, journey_id]
        );

        return res.status(201).json({
            success: true,
            message: "Memory added successfully",
            entry: entries[0],
        });
    } catch (error) {
        console.error("Create Journey Entry Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create memory",
        });
    }
};


// GET /journeys/:journey_id/entries
const getJourneyEntries = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id } = req.params;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        const [journeys] = await pool.query(
            `SELECT id FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        if (journeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        const [entries] = await pool.query(
            `SELECT *
             FROM journey_entries
             WHERE journey_id = ?
             ORDER BY entry_date ASC, sort_order ASC, id ASC`,
            [journey_id]
        );

        return res.status(200).json({
            success: true,
            entries,
        });
    } catch (error) {
        console.error("Get Journey Entries Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch memories",
        });
    }
};


// GET /journeys/:journey_id/entries/:entryId
const getJourneyEntryById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id, entryId } = req.params;

        if (!/^\d+$/.test(journey_id) || !/^\d+$/.test(entryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        const [entries] = await pool.query(
            `SELECT e.*
             FROM journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?`,
            [journey_id, userId, entryId]
        );

        if (entries.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Memory not found",
            });
        }

        return res.status(200).json({
            success: true,
            entry: entries[0],
        });
    } catch (error) {
        console.error("Get Journey Entry Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch memory",
        });
    }
};


// PUT /journeys/:journey_id/entries/:entryId
const updateJourneyEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id, entryId } = req.params;

        if (!/^\d+$/.test(journey_id) || !/^\d+$/.test(entryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        const allowedFields = ["title", "content", "entry_date", "sort_order"];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                const value = req.body[field];

                if (field === "title") {
                    if (
                        value !== null &&
                        (typeof value !== "string" || value.length > 150)
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: "Title must be at most 150 characters",
                        });
                    }
                }

                if (field === "content" && value !== null &&
                    typeof value !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Content must be a string",
                    });
                }

                if (field === "sort_order" &&
                    (!Number.isInteger(value) ||
                     value < -2147483648 ||
                     value > 2147483647)) {
                    return res.status(400).json({
                        success: false,
                        message: "sort_order must be a valid integer",
                    });
                }

                updates.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided to update",
            });
        }

        const [existing] = await pool.query(
            `SELECT e.id
             FROM journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?`,
            [journey_id, userId, entryId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Memory not found",
            });
        }

        values.push(entryId, journey_id, userId);

        await pool.query(
            `UPDATE journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             SET ${updates.join(", ")}
             WHERE e.id = ?
               AND j.id = ?
               AND j.user_id = ?`,
            values
        );

        const [updated] = await pool.query(
            `SELECT e.*
             FROM journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE e.id = ?
               AND j.id = ?
               AND j.user_id = ?`,
            [entryId, journey_id, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Memory updated successfully",
            entry: updated[0],
        });
    } catch (error) {
        console.error("Update Journey Entry Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update memory",
        });
    }
};


// DELETE /journeys/:journey_id/entries/:entryId
const deleteJourneyEntry = async (req, res) => {
    let connection;

    try {
        const userId = req.user.id;
        const { journey_id, entryId } = req.params;

        if (!/^\d+$/.test(journey_id) || !/^\d+$/.test(entryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [entries] = await connection.query(
            `SELECT e.id
             FROM journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?
             FOR UPDATE`,
            [journey_id, userId, entryId]
        );

        if (entries.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Memory not found",
            });
        }

        await connection.query(
            `DELETE FROM journey_entry_media WHERE entry_id = ?`,
            [entryId]
        );

        await connection.query(
            `DELETE FROM journey_entry_posts WHERE entry_id = ?`,
            [entryId]
        );

        await connection.query(
            `DELETE FROM journey_entries
             WHERE id = ? AND journey_id = ?`,
            [entryId, journey_id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Memory deleted successfully",
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback Error:", rollbackError);
            }
        }

        console.error("Delete Journey Entry Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete memory",
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    createJourneyEntry,
    getJourneyEntries,
    getJourneyEntryById,
    updateJourneyEntry,
    deleteJourneyEntry,
};
