
const { pool } = require("../database.js");

// POST /journeys/:journeyId/entries/:entryId/posts
const linkJourneyPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journeyId, entryId } = req.params;
        const { post_id } = req.body;

        if (
            !/^\d+$/.test(journeyId) ||
            !/^\d+$/.test(entryId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        if (
            !Number.isSafeInteger(Number(post_id)) ||
            Number(post_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid post_id is required",
            });
        }

        // Verify that this entry belongs to the user's Journey.
        const [entries] = await pool.query(
            `SELECT e.id
             FROM journey_entries e
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?`,
            [journeyId, userId, entryId]
        );

        if (entries.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey entry not found",
            });
        }

        // Assumes posts.user_id identifies the post owner.
        const [posts] = await pool.query(
            `SELECT id
             FROM posts
             WHERE id = ?
               AND user_id = ?`,
            [post_id, userId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you do not own it",
            });
        }

        const [existingLinks] = await pool.query(
            `SELECT id
             FROM journey_entry_posts
             WHERE entry_id = ?
               AND post_id = ?`,
            [entryId, post_id]
        );

        if (existingLinks.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This post is already linked to the memory",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO journey_entry_posts (entry_id, post_id)
             VALUES (?, ?)`,
            [entryId, post_id]
        );

        return res.status(201).json({
            success: true,
            message: "Post linked successfully",
            link: {
                id: result.insertId,
                entry_id: Number(entryId),
                post_id: Number(post_id),
            },
        });
    } catch (error) {
        // Also handle duplicate links if concurrent requests race.
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This post is already linked to the memory",
            });
        }

        console.error("Link Journey Post Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to link post",
        });
    }
};


// DELETE /journeys/:journeyId/entries/:entryId/posts/:postId
const unlinkJourneyPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journeyId, entryId, postId } = req.params;

        if (
            !/^\d+$/.test(journeyId) ||
            !/^\d+$/.test(entryId) ||
            !/^\d+$/.test(postId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey, entry, or post ID",
            });
        }

        const [result] = await pool.query(
            `DELETE ep
             FROM journey_entry_posts ep
             INNER JOIN journey_entries e ON e.id = ep.entry_id
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?
               AND ep.post_id = ?`,
            [journeyId, userId, entryId, postId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Linked post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post unlinked successfully",
        });
    } catch (error) {
        console.error("Unlink Journey Post Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to unlink post",
        });
    }
};

module.exports = {
    linkJourneyPost,
    unlinkJourneyPost,
};
