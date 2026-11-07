
const { pool } = require("../database.js");

const {uploadToR2, deleteFromR2} = require("../misc/cloudflare-r2-helpers.js")
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");



const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;



// POST /journeys

const createJourney = async (req, res) => {
    let uploadedCoverUrl = null;

    try {
        const userId = req.user.id;

        const {
            title,
            description = null,
            visibility = "private",
            status = "ongoing",
            start_date = null,
            end_date = null,
        } = req.body;

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

        if (!allowedVisibility.includes(visibility)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey visibility",
            });
        }

        const allowedStatus = ["ongoing", "completed"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey status",
            });
        }

        // Upload cover to R2
        let coverUrl = null;

        if (req.file) {
            const uploaded = await uploadToR2(req.file);

            coverUrl = uploaded.url;
            uploadedCoverUrl = uploaded.url;
        }

        // Save Journey
        const [result] = await pool.query(
            `INSERT INTO journeys
                (user_id, title, description, cover_url, visibility,
                 status, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title.trim(),
                description || null,
                coverUrl,
                visibility,
                status,
                start_date || null,
                end_date || null,
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
        // Clean up uploaded image if database operation fails.
        if (uploadedCoverUrl) {
            await deleteFromR2(uploadedCoverUrl);
        }

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


const getPublicJourneys = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(30, Math.max(1, parseInt(req.query.limit) || 12));
        const offset = (page - 1) * limit;

        const [journeys] = await pool.query(
            `SELECT
        j.*,
        u.username,
        u.full_name,
        u.profile_pic_url,

        (
            SELECT COUNT(*)
            FROM journey_entries je
            WHERE je.journey_id = j.id
        ) AS entries

    FROM journeys j

    JOIN users u ON j.user_id = u.id

    WHERE j.visibility = 'public'

    ORDER BY j.updated_at DESC

    LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [[countResult]] = await pool.query(
            `SELECT COUNT(*) AS total
             FROM journeys
             WHERE visibility = 'public'`
        );

        return res.status(200).json({
            success: true,
            journeys,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(countResult.total / limit),
                totalJourneys: countResult.total,
                hasMore: page * limit < countResult.total
            }
        });

    } catch (error) {
        console.error("Get public Journeys error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch public Journeys"
        });
    }
};

const updateJourney = async (req, res) => {
    let uploadedCoverUrl = null;

    try {
        const userId = req.user.id;
        const { journey_id } = req.params;

        if (!/^\d+$/.test(journey_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Journey ID",
            });
        }

        const [existing] = await pool.query(
            `SELECT id, cover_url
             FROM journeys
             WHERE id = ? AND user_id = ?`,
            [journey_id, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        const oldCoverUrl = existing[0].cover_url;

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

        // Upload replacement cover if provided.
        if (req.file) {
            const uploaded = await uploadToR2(req.file);

            uploadedCoverUrl = uploaded.url;

            updates.push("cover_url = ?");
            values.push(uploadedCoverUrl);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided to update",
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

        // Delete old cover only after successful database update.
        if (
            uploadedCoverUrl &&
            oldCoverUrl &&
            oldCoverUrl !== uploadedCoverUrl
        ) {
            await deleteFromR2(oldCoverUrl);
        }

        return res.status(200).json({
            success: true,
            message: "Journey updated successfully",
            journey: updated[0],
        });

    } catch (error) {
        // Clean up newly uploaded cover if update fails.
        if (uploadedCoverUrl) {
            await deleteFromR2(uploadedCoverUrl);
        }

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
            `SELECT id, cover_url
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

        // Delete Journey cover from R2 after successful DB deletion.
        if (journeys[0].cover_url) {
            await deleteFromR2(journeys[0].cover_url);
        }

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
    deleteJourney,
    getPublicJourneys
};
