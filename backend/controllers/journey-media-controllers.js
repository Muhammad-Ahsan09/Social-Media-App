const { pool } = require("../database.js");

// POST /journeys/:journeyId/entries/:entryId/media

const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Use your existing configured Cloudinary instance.
// Example: const { cloudinary } = require("../utils/cloudinary");

// POST /journeys/:journeyId/entries/:entryId/media
const addJourneyMedia = async (req, res) => {
    const uploadedAssets = [];

    try {
        const userId = req.user.id;
        const { journeyId, entryId } = req.params;
        const { caption = null, sort_order = 0 } = req.body;

        // Validate IDs
        if (
            !/^\d+$/.test(journeyId) ||
            !/^\d+$/.test(entryId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey or entry ID",
            });
        }

        // Multer must provide an array of files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files provided",
            });
        }

        if (req.files.length > 10) {
            return res.status(400).json({
                success: false,
                message: "You can upload a maximum of 10 files at once",
            });
        }

        // Validate caption
        if (
            caption !== null &&
            (typeof caption !== "string" || caption.length > 500)
        ) {
            return res.status(400).json({
                success: false,
                message: "Caption must be at most 500 characters",
            });
        }

        // Validate starting sort order
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

        // Validate all files before uploading any of them
        for (const file of req.files) {
            if (
                !file.mimetype.startsWith("image/") &&
                !file.mimetype.startsWith("video/")
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported file type: ${file.originalname}`,
                });
            }
        }

        // Verify ownership before uploading
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

        // Upload all files to Cloudinary
        const mediaRecords = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];

            const resourceType = file.mimetype.startsWith("video/")
                ? "video"
                : "image";

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
                    .createReadStream(file.buffer)
                    .pipe(uploadStream);
            });

            // Track immediately so a later failure can clean it up
            uploadedAssets.push({
                public_id: result.public_id,
                resource_type: resourceType,
            });

            mediaRecords.push({
                media_url: result.secure_url,
                media_type: resourceType,
                caption,
                sort_order: parsedSortOrder + i,
            });
        }

        // Save every media record in a transaction
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            for (const media of mediaRecords) {
                await connection.query(
                    `INSERT INTO journey_entry_media
                        (entry_id, media_url, media_type, caption, sort_order)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        entryId,
                        media.media_url,
                        media.media_type,
                        media.caption,
                        media.sort_order,
                    ]
                );
            }

            const [savedMedia] = await connection.query(
                `SELECT *
                 FROM journey_entry_media
                 WHERE entry_id = ?
                   AND sort_order >= ?
                   AND sort_order < ?
                 ORDER BY sort_order ASC, id ASC`,
                [
                    entryId,
                    parsedSortOrder,
                    parsedSortOrder + mediaRecords.length,
                ]
            );

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Media uploaded and attached successfully",
                media: savedMedia,
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Journey Media Upload Error:", error);

        // Delete successfully uploaded assets if the operation fails
        await Promise.all(
            uploadedAssets.map(async (asset) => {
                try {
                    await cloudinary.uploader.destroy(
                        asset.public_id,
                        { resource_type: asset.resource_type }
                    );
                } catch (cleanupError) {
                    console.error(
                        "Cloudinary cleanup error:",
                        cleanupError.message
                    );
                }
            })
        );

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
