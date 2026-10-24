const { pool } = require("../database");

// Like a Scene
const likeScene = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sceneId } = req.params;

        if (!/^\d+$/.test(sceneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Scene ID."
            });
        }

        // Ensure the Scene exists.
        const [scenes] = await pool.query(
            "SELECT id FROM scenes WHERE id = ?",
            [sceneId]
        );

        if (scenes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Scene not found."
            });
        }

        // Insert a like. The unique constraint prevents duplicate likes.
        const [result] = await pool.query(
            `INSERT IGNORE INTO scene_likes (scene_id, user_id)
             VALUES (?, ?)`,
            [sceneId, userId]
        );

        // Return the current like count and status.
        const [[likeData]] = await pool.query(
            `SELECT
                COUNT(*) AS likes_count,
                EXISTS(
                    SELECT 1
                    FROM scene_likes
                    WHERE scene_id = ? AND user_id = ?
                ) AS is_liked
             FROM scene_likes
             WHERE scene_id = ?`,
            [sceneId, userId, sceneId]
        );

        return res.status(200).json({
            success: true,
            message: result.affectedRows
                ? "Scene liked successfully."
                : "Scene was already liked.",
            is_liked: Boolean(likeData.is_liked),
            likes_count: Number(likeData.likes_count)
        });
    } catch (error) {
        console.error("Like Scene error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to like Scene."
        });
    }
};

// Unlike a Scene
const unlikeScene = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sceneId } = req.params;

        if (!/^\d+$/.test(sceneId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Scene ID."
            });
        }

        const [result] = await pool.query(
            `DELETE FROM scene_likes
             WHERE scene_id = ? AND user_id = ?`,
            [sceneId, userId]
        );

        const [[likeData]] = await pool.query(
            `SELECT COUNT(*) AS likes_count
             FROM scene_likes
             WHERE scene_id = ?`,
            [sceneId]
        );

        return res.status(200).json({
            success: true,
            message: result.affectedRows
                ? "Scene unliked successfully."
                : "Scene was not liked.",
            is_liked: false,
            likes_count: Number(likeData.likes_count)
        });
    } catch (error) {
        console.error("Unlike Scene error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to unlike Scene."
        });
    }
};

module.exports = {
    likeScene,
    unlikeScene
};
