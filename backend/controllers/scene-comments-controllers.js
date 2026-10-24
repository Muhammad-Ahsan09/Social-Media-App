
const { pool } = require("../database")

// GET /api/scenes/:sceneId/comments
const getSceneComments = async (req, res) => {
    try {
        const { sceneId } = req.params;
        const userId = req.user.id;

        if (!/^\d+$/.test(sceneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Scene ID.",
            });
        }

        // Verify the Scene exists and the user can access it.
        const [scenes] = await pool.query(
            `SELECT id
             FROM scenes
             WHERE id = ?
               AND status = 'published'
               AND (visibility = 'public' OR user_id = ?)
             LIMIT 1`,
            [sceneId, userId]
        );

        if (scenes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Scene not found.",
            });
        }

        const [comments] = await pool.query(
            `SELECT
                sc.id,
                sc.scene_id,
                sc.user_id,
                sc.content,
                sc.created_at,
                sc.updated_at,
                u.username,
                u.profile_pic_url
             FROM scene_comments sc
             JOIN users u ON u.id = sc.user_id
             WHERE sc.scene_id = ?
             ORDER BY sc.created_at ASC, sc.id ASC`,
            [sceneId]
        );

        return res.status(200).json({
            success: true,
            comments,
        });
    } catch (error) {
        console.error("Get Scene comments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch comments.",
        });
    }
};


// POST /api/scenes/:sceneId/comments
const createSceneComment = async (req, res) => {
    try {
        const { sceneId } = req.params;
        const userId = req.user.id;
        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (!/^\d+$/.test(sceneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Scene ID.",
            });
        }

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty.",
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot exceed 2000 characters.",
            });
        }

        // Verify the Scene exists and the user can access it.
        const [scenes] = await pool.query(
            `SELECT id
             FROM scenes
             WHERE id = ?
               AND status = 'published'
               AND (visibility = 'public' OR user_id = ?)
             LIMIT 1`,
            [sceneId, userId]
        );

        if (scenes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Scene not found.",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO scene_comments (scene_id, user_id, content)
             VALUES (?, ?, ?)`,
            [sceneId, userId, content]
        );

        // Return the newly created comment with its author's information.
        const [comments] = await pool.query(
            `SELECT
                sc.id,
                sc.scene_id,
                sc.user_id,
                sc.content,
                sc.created_at,
                sc.updated_at,
                u.username,
                u.profile_pic_url
             FROM scene_comments sc
             JOIN users u ON u.id = sc.user_id
             WHERE sc.id = ?
             LIMIT 1`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: comments[0],
        });
    } catch (error) {
        console.error("Create Scene comment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add comment.",
        });
    }
};

module.exports = {
    getSceneComments,
    createSceneComment,
};
