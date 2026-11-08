
const { pool } = require("../database.js");
const {
    uploadToR2,
    deleteFromR2,
} = require("../misc/cloudflare-r2-helpers.js");


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

        // Validate files
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

        // Validate sort order
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

        // Validate all files before uploading
        for (const file of req.files) {
            if (
                !file.mimetype?.startsWith("image/") &&
                !file.mimetype?.startsWith("video/")
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

        // Upload all files to Cloudflare R2
        const mediaRecords = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];

            const mediaType = file.mimetype.startsWith("video/")
                ? "video"
                : "image";

            const result = await uploadToR2(file, "journeys/memories");

            // Track uploaded URL for cleanup if a later operation fails
            uploadedAssets.push(result.url);

            mediaRecords.push({
                media_url: result.url,
                media_type: mediaType,
                caption,
                sort_order: parsedSortOrder + i,
            });
        }

        // Save media records in a transaction
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

        // Clean up successfully uploaded R2 files if operation fails
        await Promise.all(
            uploadedAssets.map(async (fileUrl) => {
                try {
                    await deleteFromR2(fileUrl);
                } catch (cleanupError) {
                    console.error(
                        "R2 cleanup error:",
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
    let connection;

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

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Fetch media URL and verify ownership
        const [media] = await connection.query(
            `SELECT m.id, m.media_url
             FROM journey_entry_media m
             INNER JOIN journey_entries e ON e.id = m.entry_id
             INNER JOIN journeys j ON j.id = e.journey_id
             WHERE j.id = ?
               AND j.user_id = ?
               AND e.id = ?
               AND m.id = ?
             FOR UPDATE`,
            [journeyId, userId, entryId, mediaId]
        );

        if (media.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Media not found",
            });
        }

        // Delete database record
        await connection.query(
            `DELETE FROM journey_entry_media
             WHERE id = ? AND entry_id = ?`,
            [mediaId, entryId]
        );

        await connection.commit();

        // Delete actual file from R2 after successful DB deletion
        try {
            await deleteFromR2(media[0].media_url);
        } catch (cleanupError) {
            console.error(
                "R2 media deletion error:",
                cleanupError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: "Media removed from memory successfully",
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback Error:", rollbackError);
            }
        }

        console.error("Delete Journey Media Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove media",
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    addJourneyMedia,
    deleteJourneyMedia,
};
