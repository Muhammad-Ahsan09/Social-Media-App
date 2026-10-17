import { pool } from "../database.js";
import cloudinary from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const createMoment = async (req, res) => {
    let uploadedPublicId
    try {
        const userId = req.user.id; // From authenticated middleware
        // const { imageUrl } = req.body;

        // Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image.",
            });
        }

        let image_name = req.file.filename;
        // const image_name = req.file.filename;

        const cloudinary_result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "moments-images",
                resource_type: "image"
            }
        );

        uploadedPublicId = cloudinary_result.public_id;

        const image_url = cloudinary_result.secure_url

        const [result] = await pool.query(
            `INSERT INTO moments
        (user_id, image_url, created_at, expires_at)
       VALUES (?, ?, UTC_TIMESTAMP(),
               DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR))`,
            [userId, image_url]
        );

        res.status(201).json({
            message: "Moment created successfully",
            id: result.insertId,
        });


    } catch (error) {
        console.error("Create Moment error:", error);

        // Remove the uploaded image if the database insert failed
        if (uploadedPublicId) {
            try {
                await cloudinary.uploader.destroy(uploadedPublicId);
            } catch (cleanupError) {
                console.error("Cloudinary cleanup error:", cleanupError);
            }
        }

        res.json({
            success: false,
            message: error.message
        })
    }

}


export const getMoments = async (req, res) => {
    try {
        const result = await pool.query(`
           SELECT
            moments.*,
            users.username,
            users.profile_pic_url
        FROM moments
        INNER JOIN users
            ON moments.user_id = users.id
        WHERE moments.expires_at > UTC_TIMESTAMP()
        ORDER BY RAND()
        LIMIT 20;`
        );

        res.json({
            success: true,
            moments: result[0]
        })
    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}
