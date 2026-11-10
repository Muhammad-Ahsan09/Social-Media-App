const { pool } = require("../database");
const {uploadToR2, deleteFromR2} = require("../misc/cloudflare-r2-helpers")
const ffprobe = require("ffprobe-static");
const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

// Maximum Scene duration: 60 seconds
const MAX_SCENE_DURATION = 60;

const execFileAsync = promisify(execFile);

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
];


// Extract actual video duration using FFprobe.
const getVideoDuration = async (buffer, originalName) => {
    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "solace-scene-")
    );

    try {
        const extension =
            path.extname(originalName).toLowerCase() || ".mp4";

        const tempFile = path.join(tempDir, `video${extension}`);

        await fs.writeFile(tempFile, buffer);

        const { stdout } = await execFileAsync(
            ffprobe.path,
            [
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                tempFile,
            ],
            {
                timeout: 30000,
                maxBuffer: 1024 * 1024,
            }
        );

        const duration = Number.parseFloat(stdout.trim());

        if (!Number.isFinite(duration) || duration <= 0) {
            throw new Error("Could not determine video duration.");
        }

        return duration;

    } finally {
        await fs.rm(tempDir, {
            recursive: true,
            force: true,
        });
    }
};


// POST /api/scenes
const createScene = async (req, res) => {
    let uploadedVideo = null;

    try {
        const userId = req.user.id;
        const { caption = null, visibility = "public" } = req.body;

        // Validate uploaded file.
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a video.",
            });
        }

        if (!ALLOWED_VIDEO_TYPES.includes(req.file.mimetype)) {
            return res.status(400).json({
                message: "Only MP4, WebM and MOV videos are allowed.",
            });
        }

        if (req.file.size > MAX_VIDEO_SIZE) {
            return res.status(400).json({
                message: "Video size cannot exceed 100 MB.",
            });
        }

        // Validate visibility.
        const allowedVisibility = [
            "public",
            "followers",
            "private",
        ];

        if (!allowedVisibility.includes(visibility)) {
            return res.status(400).json({
                message: "Invalid visibility setting.",
            });
        }

        // Extract actual duration before uploading.
        const duration = await getVideoDuration(
            req.file.buffer,
            req.file.originalname
        );

        if (duration > MAX_SCENE_DURATION) {
            return res.status(400).json({
                message: "A Scene cannot be longer than 60 seconds.",
            });
        }

        // Upload video to Cloudflare R2.
        uploadedVideo = await uploadToR2(
            req.file,
            "scenes"
        );

        if (!uploadedVideo?.url || !uploadedVideo?.key) {
            throw new Error("R2 upload failed.");
        }

        // Store public R2 URL in MySQL.
        const videoUrl = uploadedVideo.url;

        const [insertResult] = await pool.query(
            `INSERT INTO scenes
                (user_id, video_url, caption, duration_seconds, visibility, status)
             VALUES (?, ?, ?, ?, ?, 'published')`,
            [
                userId,
                videoUrl,
                caption?.trim() || null,
                duration,
                visibility,
            ]
        );

        // Return newly created Scene with creator information.
        const [rows] = await pool.query(
            `SELECT
                s.*,
                u.username,
                u.profile_pic_url
             FROM scenes s
             JOIN users u ON u.id = s.user_id
             WHERE s.id = ? AND s.user_id = ?`,
            [insertResult.insertId, userId]
        );

        return res.status(201).json({
            message: "Scene created successfully.",
            scene: rows[0],
        });

    } catch (error) {
        console.error("Create scene error:", error);

        // Clean up R2 object if database insertion fails.
        if (uploadedVideo?.key) {
            try {
                await deleteFromR2(uploadedVideo.key);
            } catch (cleanupError) {
                console.error(
                    "R2 cleanup error:",
                    cleanupError
                );
            }
        }

        return res.status(500).json({
            message: "Failed to create Scene.",
        });
    }
};


// GET /api/scenes
const getScenes = async (req, res) => {
    try {
        const userId = req.user.id;

        // Keep pagination within sensible bounds.
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const requestedOffset = Number.parseInt(req.query.offset, 10);

        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 50)
            : 10;

        const offset = Number.isInteger(requestedOffset)
            ? Math.max(requestedOffset, 0)
            : 0;

        const [scenes] = await pool.query(
            `SELECT
        s.*,
        u.username,
        u.profile_pic_url,

        (
            SELECT COUNT(*)
            FROM scene_likes sl
            WHERE sl.scene_id = s.id
        ) AS likes_count,

        EXISTS (
            SELECT 1
            FROM scene_likes sl
            WHERE sl.scene_id = s.id
              AND sl.user_id = ?
        ) AS is_liked

     FROM scenes s
     JOIN users u ON u.id = s.user_id

     WHERE s.status = 'published'
       AND (s.visibility = 'public' OR s.user_id = ?)

     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
            [userId, userId, limit, offset]
        );

        return res.status(200).json({
            scenes,
            limit,
            offset,
        });
    } catch (error) {
        console.error("Get scenes error:", error);

        return res.status(500).json({
            message: "Failed to fetch Scenes.",
        });
    }
};

// DELETE /api/scenes/:sceneId
const deleteScene = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sceneId } = req.params;

        if (!/^\d+$/.test(sceneId)) {
            return res.status(400).json({
                message: "Invalid Scene ID.",
            });
        }

        // Find Scene and verify ownership.
        const [scenes] = await pool.query(
            `SELECT id, user_id, video_url
             FROM scenes
             WHERE id = ? AND user_id = ?`,
            [sceneId, userId]
        );

        if (scenes.length === 0) {
            return res.status(404).json({
                message: "Scene not found.",
            });
        }

        const scene = scenes[0];

        // Delete video from R2.
        await deleteFromR2(scene.video_url);

        // Delete database record.
        await pool.query(
            `DELETE FROM scenes
             WHERE id = ? AND user_id = ?`,
            [sceneId, userId]
        );

        return res.status(200).json({
            message: "Scene deleted successfully.",
        });

    } catch (error) {
        console.error("Delete scene error:", error);

        return res.status(500).json({
            message: "Failed to delete Scene.",
        });
    }
};



const getUserScenes = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const [scenes] = await pool.query(
            `SELECT
                s.*,
                u.username,
                u.profile_pic_url
             FROM scenes s
             JOIN users u ON s.user_id = u.id
             WHERE s.user_id = ?
             AND s.status = 'published'
             AND (
                s.visibility = 'public'
                OR s.user_id = ?
             )
             ORDER BY s.created_at DESC`,
            [userId, currentUserId]
        );

        return res.status(200).json({
            success: true,
            scenes
        });

    } catch (error) {
        console.error("Error fetching user Scenes:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    createScene,
    getScenes,
    getUserScenes,
    deleteScene
};
