const { pool } = require("../database.js");

// POST /journeys/:journeyId/entries/:entryId/media

const streamifier = require("streamifier");

// Use your existing configured Cloudinary instance.
// Example: const { cloudinary } = require("../utils/cloudinary");

// POST /journeys/:journeyId/entries/:entryId/media
const addJourneyMedia = async (req, res) => {
    let uploadedAsset = null;
    let resourceType = null;

    try {
        const userId = req.user.id;
        const { journeyId, entryId } = req.params;
        const { caption = null, sort_order = 0 } = req.body;

        // Validate IDs.
        if (
            !/^\d+$/.test(journeyId) ||
            !/^\d+$/.test(entryId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        // Multer must provide the file in memory.
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided",
            });
        }

        // Validate file type.
        if (req.file.mimetype.startsWith("image/")) {
            resourceType = "image";
        } else if (req.file.mimetype.startsWith("video/")) {
            resourceType = "video";
        } else {
            return res.status(400).json({
                success: false,
                message: "Unsupported file type. Upload an image or video.",
            });
        }

        if (caption !== null &&
            (typeof caption !== "string" || caption.length > 500)) {
            return res.status(400).json({
                success: false,
                message: "Caption must be at most 500 characters",
            });
        }

        // FormData fields usually arrive as strings, so convert sort_order.
        const parsedSortOrder =
            sort_order === undefined || sort_order === ""
                ? 0
                : Number(sort_order);

        if (
            !Number.isInteger(parsedSortOrder) ||
            parsedSortOrder < -2147483648 ||
            parsedSortOrder > 2147483647
        ) {
            return res.status(400).json({
                success: false,
                message: "sort_order must be a valid integer",
            });
        }

        // Verify ownership BEFORE uploading anything.
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

        // Configure Cloudinary based on the file type.
        const uploadOptions = {
            folder: `journey-media/${resourceType === "video" ? "videos" : "images"}`,
            resource_type: resourceType,
        };

        if (resourceType === "image") {
            uploadOptions.transformation = [
                {
                    width: 1200,
                    crop: "limit",
                    quality: "auto",
                },
            ];
        } else {
            uploadOptions.eager = [
                {
                    streaming_profile: "full_hd",
                    format: "m3u8",
                },
            ];
            uploadOptions.eager_async = true;
        }

        // Upload the in-memory file buffer to Cloudinary.
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(result);
                }
            );

            streamifier
                .createReadStream(req.file.buffer)
                .pipe(uploadStream);
        });

        uploadedAsset = result;
        const mediaUrl = result.secure_url;

        // Save Cloudinary URL and media metadata in TiDB.
        const [insertResult] = await pool.query(
            `INSERT INTO journey_entry_media
                (entry_id, media_url, media_type, caption, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [
                entryId,
                mediaUrl,
                resourceType,
                caption,
                parsedSortOrder,
            ]
        );

        const [media] = await pool.query(
            `SELECT *
             FROM journey_entry_media
             WHERE id = ?`,
            [insertResult.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Media uploaded and attached successfully",
            media: media[0],
        });
    } catch (error) {
        console.error("Journey Media Upload Error:", error);

        // Clean up the Cloudinary asset if the upload succeeded
        // but saving its record in the database failed.
        if (uploadedAsset?.public_id && resourceType) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedAsset.public_id,
                    { resource_type: resourceType }
                );
            } catch (cleanupError) {
                console.error(
                    "Cloudinary cleanup error:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload and attach media",
        });
    }
};



// DELETE /journeys/:journeyId/entries/:entryId/media/:mediaId
const deleteJourneyMedia = async (req, res) => {
    try {
        const userId = req.user.id;
        const { journeyId, entryId, mediaId } = req.params;

        if (
            !/^\d+$/.test(journeyId) ||
            !/^\d+$/.test(entryId) ||
            !/^\d+$/.test(mediaId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey, entry, or media ID",
            });
        }

        const [result] = await pool.query(
            `DELETE m
             FROM journey_entry_media m
             INNER JOIN journey_entries e ON e.id = m.entry_id
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?
               AND m.id = ?`,
            [journeyId, userId, entryId, mediaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Media not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Media removed from memory successfully",
        });
    } catch (error) {
        console.error("Delete Journey Media Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove media",
        });
    }
};

module.exports = {
    addJourneyMedia,
    deleteJourneyMedia,
};
