
const { Readable } = require("stream");
const { pool } = require("../database");
const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Maximum Scene duration: 120 seconds
const MAX_SCENE_DURATION = 120;

// Extract a Cloudinary public ID from its uploaded video URL.
const getCloudinaryPublicId = (videoUrl) => {
    try {
        const url = new URL(videoUrl);
        const marker = "/video/upload/";
        const uploadIndex = url.pathname.indexOf(marker);

        if (uploadIndex === -1) {
            return null;
        }

        let path = url.pathname.slice(uploadIndex + marker.length);
        const parts = path.split("/");

        // Cloudinary URLs normally contain a version segment, e.g. v123456.
        const versionIndex = parts.findIndex((part) =>
            /^v\d+$/.test(part)
        );

        if (versionIndex !== -1) {
            path = parts.slice(versionIndex + 1).join("/");
        }

        // Remove the file extension to get the public ID.
        return path.replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
};

// Upload an in-memory Multer file to Cloudinary.
const uploadVideoToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "solace/scenes",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from([buffer]).pipe(uploadStream);
    });
};

// Delete a video from Cloudinary.
const deleteCloudinaryVideo = async (publicId) => {
    if (!publicId) {
        throw new Error("Could not determine the Cloudinary public ID.");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
        invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Cloudinary could not delete the video.");
    }
};

// POST /api/scenes
const createScene = async (req, res) => {
    let uploadedVideo = null;

    try {
        const userId = req.user.id;
        const { caption = null, visibility = "public" } = req.body;

        // Validate the uploaded file.
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a video.",
            });
        }

        if (!req.file.mimetype?.startsWith("video/")) {
            return res.status(400).json({
                message: "Only video files are allowed.",
            });
        }

        // Multer should enforce this limit too.
        if (req.file.size > 100 * 1024 * 1024) {
            return res.status(400).json({
                message: "Video size cannot exceed 100 MB.",
            });
        }

        const allowedVisibility = ["public", "followers", "private"];

        if (!allowedVisibility.includes(visibility)) {
            return res.status(400).json({
                message: "Invalid visibility setting.",
            });
        }

        // Upload video to Cloudinary.
        uploadedVideo = await uploadVideoToCloudinary(req.file.buffer);

        const duration = Number(uploadedVideo.duration);

        // Cloudinary provides the actual video duration after processing.
        if (!Number.isFinite(duration) || duration <= 0) {
            await deleteCloudinaryVideo(uploadedVideo.public_id);
            uploadedVideo = null;

            return res.status(400).json({
                message: "Could not determine the video's duration.",
            });
        }

        if (duration > MAX_SCENE_DURATION) {
            await deleteCloudinaryVideo(uploadedVideo.public_id);
            uploadedVideo = null;

            return res.status(400).json({
                message: "A Scene cannot be longer than 120 seconds.",
            });
        }

        const videoUrl = uploadedVideo.secure_url;

        // Store the Scene in MySQL.
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

        // Return the newly created Scene with creator information.
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

        // Prevent an orphaned Cloudinary video if the database insert fails.
        if (uploadedVideo?.public_id) {
            try {
                await deleteCloudinaryVideo(uploadedVideo.public_id);
            } catch (cleanupError) {
                console.error(
                    "Cloudinary cleanup error:",
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
                u.profile_pic_url
             FROM scenes s
             JOIN users u ON u.id = s.user_id
             WHERE s.status = 'published'
               AND (s.visibility = 'public' OR s.user_id = ?)
             ORDER BY s.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
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

        // Find the Scene and verify ownership.
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
        const publicId = getCloudinaryPublicId(scene.video_url);

        // Delete the Cloudinary video before removing the database record.
        await deleteCloudinaryVideo(publicId);

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

module.exports = {
    createScene,
    getScenes,
    deleteScene
};
