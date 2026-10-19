
const { pool } = require("../database.js");

// POST /journeys
const createJourney = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description = null,
            cover_url = null,
            visibility = "private",
            status = "ongoing",
            start_date = null,
            end_date = null,
        } = req.body;

        console.log(title)

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Journey title is required",
            });
        }

        const allowedVisibility = [
            "private",
            "public",
            "followers",
            "selected",
        ];

        const allowedStatus = ["ongoing", "completed"];

        if (!allowedVisibility.includes(visibility)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey visibility",
            });
        }

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey status",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO journeys
                (user_id, title, description, cover_url, visibility,
                 status, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title.trim(),
                description,
                cover_url,
                visibility,
                status,
                start_date,
                end_date,
            ]
        );

        const [journeys] = await pool.query(
            `SELECT *
             FROM journeys
             WHERE id = ? AND user_id = ?`,
            [result.insertId, userId]
        );

        return res.status(201).json({
            success: true,
            message: "Journey created successfully",
            journey: journeys[0],
        });
    } catch (error) {
        console.error("Create Journey Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create Journey",
        });
    }
};


// GET /journeys
const getJourneys = async (req, res) => {
    try {
        const userId = req.user.id;

        const [journeys] = await pool.query(
            `SELECT *
             FROM journeys
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            journeys,
        });
    } catch (error) {
        console.error("Get Journeys Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Journeys",
        });
    }
};


// GET /journeys/:journey_id
const getJourneyById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id } = req.params;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        // Fetch the Journey
        const [journeys] = await pool.query(
            `SELECT *
             FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        if (journeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        const journey = journeys[0];

        // Fetch its entries
        const [entries] = await pool.query(
            `SELECT id, title, content, entry_date
             FROM journey_entries
             WHERE journey_id = ? AND user_id = ?
             ORDER BY entry_date ASC, sort_order ASC`,
            [journey_id, userId]
        );

        // Transform the database data into your frontend mock format
        const formattedJourney = {
            id: journey.id,
            title: journey.title,
            description: journey.description,
            cover: journey.cover_url ||
                "bg-gradient-to-br from-[#829D8A] via-[#607D70] to-[#334F45]",
            visibility: journey.visibility,
            status: journey.status,
            entries: entries.map((entry) => ({
                id: entry.id,
                title: entry.title,
                text: entry.content,
                date: entry.entry_date
                    ? new Date(entry.entry_date).toISOString().split("T")[0]
                    : null,
                createdAt: entry.entry_date
                    ? new Date(entry.entry_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })
                    : null,
            })),
        };

        return res.status(200).json({
            success: true,
            journey: formattedJourney,
        });

    } catch (error) {
        console.error("Get Journey Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch Journey",
        });
    }
};


const updateJourney = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journey_id } = req.params;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        const allowedFields = [
            "title",
            "description",
            "cover_url",
            "visibility",
            "status",
            "start_date",
            "end_date",
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates.push(`${field} = ?`);
                values.push(
                    field === "title" && typeof req.body[field] === "string"
                        ? req.body[field].trim()
                        : req.body[field]
                );
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided to update",
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(req.body, "title") &&
            (typeof req.body.title !== "string" || !req.body.title.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Journey title cannot be empty",
            });
        }

        if (
            req.body.visibility !== undefined &&
            !["private", "public", "followers", "selected"].includes(
                req.body.visibility
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey visibility",
            });
        }

        if (
            req.body.status !== undefined &&
            !["ongoing", "completed"].includes(req.body.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey status",
            });
        }

        const [existing] = await pool.query(
            `SELECT id FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        values.push(journey_id, userId);

        await pool.query(
            `UPDATE journeys
             SET ${updates.join(", ")},
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            values
        );

        const [updated] = await pool.query(
            `SELECT *
             FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Journey updated successfully",
            journey: updated[0],
        });
    } catch (error) {
        console.error("Update Journey Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update Journey",
        });
    }
};



const deleteJourney = async (req, res) => {
    let connection;

    try {
        const userId = req.user.id;
        const { journey_id } = req.params;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [journeys] = await connection.query(
            `SELECT id
             FROM journeys
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [journey_id, userId]
        );

        if (journeys.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        // Remove media attached to entries in this Journey.
        await connection.query(
            `DELETE FROM journey_entry_media
             WHERE entry_id IN (
                 SELECT id FROM journey_entries
                 WHERE journey_id = ?
             )`,
            [journey_id]
        );

        // Remove linked-post associations, not the posts themselves.
        await connection.query(
            `DELETE FROM journey_entry_posts
             WHERE entry_id IN (
                 SELECT id FROM journey_entries
                 WHERE journey_id = ?
             )`,
            [journey_id]
        );

        await connection.query(
            `DELETE FROM journey_entries
             WHERE journey_id = ?`,
            [journey_id]
        );

        await connection.query(
            `DELETE FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Journey deleted successfully",
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Delete Journey Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete Journey",
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};




module.exports = {
    createJourney,
    getJourneys,
    getJourneyById,
    updateJourney,
    deleteJourney
};
