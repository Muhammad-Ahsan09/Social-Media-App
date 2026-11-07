
const { pool } = require("../database");
const sharp = require("sharp");
const path = require("path");
const { randomUUID } = require("crypto");

const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

// Cloudflare R2 Configuration
const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL.replace(/\/$/, "");


// Helper: Upload file to Cloudflare R2
const uploadToR2 = async (buffer, key, contentType) => {

    await R2.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));

    return `${PUBLIC_URL}/${key}`;
};


// Helper: Delete file from Cloudflare R2
const deleteFromR2 = async (key) => {

    await R2.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    }));

};


// Helper: Extract R2 object key from its public URL
const getR2KeyFromUrl = (url) => {

    const parsedUrl = new URL(url);

    return decodeURIComponent(
        parsedUrl.pathname.replace(/^\/+/, "")
    );

};


const uploadPost = async (req, res) => {
    try {

        const { description, user_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }

        let resource_type = "image";
        let folder = "";
        let fileBuffer = req.file.buffer;
        let contentType = req.file.mimetype;

        const extension = path.extname(req.file.originalname).toLowerCase();

        // Determine file type
        if (req.file.mimetype.startsWith("video/")) {

            resource_type = "video";
            folder = "posts/videos";

        } else if (req.file.mimetype.startsWith("image/")) {

            resource_type = "image";
            folder = "posts/images";

            // Resize images to maximum width of 1200px
            fileBuffer = await sharp(req.file.buffer)
                .rotate()
                .resize({
                    width: 1200,
                    withoutEnlargement: true
                })
                .toBuffer();

        } else {

            return res.status(400).json({
                error: "Unsupported file type. Use an image or video."
            });

        }

        // Generate a unique object key
        const fileName = `${randomUUID()}${extension}`;
        const key = `${folder}/${fileName}`;

        // Upload to R2
        const media_url = await uploadToR2(
            fileBuffer,
            key,
            contentType
        );

        // Save to database
        await pool.query(
            "INSERT INTO posts(user_id, description, imageUrl, resource_type) values (?,?,?,?)",
            [user_id, description, media_url, resource_type]
        );

        return res.status(200).json({
            message: "Successful",
            url: media_url
        });

    } catch (error) {

        console.error("R2 upload error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });

    }
};


const getPosts = async (req, res) => {
    try {
        const userid = req.user.id;

        const response = await pool.query(`
        SELECT
            posts.id,
            posts.user_id,
            posts.description,
            posts.imageUrl,
            posts.resource_type,
            posts.likes,

            users.profile_pic_url,
            users.full_name,

            EXISTS (
                SELECT 1
                FROM post_liked pl
                WHERE pl.post_id = posts.id
                AND pl.user_id = ?
            ) AS is_liked

        FROM posts
        JOIN users ON posts.user_id = users.id

        ORDER BY RAND()
        LIMIT 20;`, [userid]);

        const posts = response[0];
        res.json(posts);

    } catch (error) {
        console.log(error.message);
    }
};


const likePost = async (req, res) => {
    try {
        const userid = req.params.userid;
        const postid = req.params.postid;

        await pool.query(`
        INSERT INTO post_liked(user_id, post_id) values (?, ?)
        `, [userid, postid]);

        await pool.query(`UPDATE posts SET likes = (
            SELECT COUNT(*) FROM post_liked WHERE post_id = ?
        ) WHERE id = ?`, [postid, postid]);

        res.json({ message: "post liked successfully" });

    } catch (error) {
        console.log(error.message);
    }
};


const unlikePost = async (req, res) => {
    try {
        const userid = req.params.userid;
        const postid = req.params.postid;

        await pool.query(
            `DELETE FROM post_liked WHERE user_id = ? AND post_id = ?;`,
            [userid, postid]
        );

        await pool.query(`UPDATE posts SET likes = (
            SELECT COUNT(*) FROM post_liked WHERE post_id = ?
        ) WHERE id = ?`, [postid, postid]);

        res.json({ message: "Post unliked successfully" });

    } catch (error) {
        console.log(error.message);
    }
};


const getLikedPosts = async (req, res) => {
    try {
        const userid = req.params.userid;

        const posts = await pool.query(`
        SELECT id FROM posts WHERE id IN (
            SELECT post_id FROM post_liked WHERE user_id = ?
        )
        `, [userid]);

        res.json(posts[0]);

    } catch (error) {
        console.log(error.message);
    }
};


const getPost = async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const response = await pool.query(
            `SELECT * FROM posts WHERE id = ?;`,
            [post_id]
        );

        const post = response[0][0];
        res.json(post);

    } catch (error) {
        console.log(error.message);
    }
};


const getUserPosts = async (req, res) => {
    try {
        const user_id = req.params.userid;

        const response = await pool.query(
            `SELECT * FROM posts WHERE user_id = ?;`,
            [user_id]
        );

        const posts = response[0];
        res.json(posts);

    } catch (error) {
        console.log(error.message);
    }
};


const deletePost = async (req, res) => {
    try {

        const postid = req.params.postid;

        const response = await pool.query(
            `SELECT imageUrl FROM posts WHERE id = ?;`,
            [postid]
        );

        const post = response[0][0];

        if (post && post.imageUrl) {

            try {

                const key = getR2KeyFromUrl(post.imageUrl);

                await deleteFromR2(key);

            } catch (error) {

                console.error("R2 deletion error:", error.message);

            }

        }

        await pool.query(
            `DELETE FROM comments WHERE post_id = ?`,
            [postid]
        );

        await pool.query(
            `DELETE FROM post_liked WHERE post_id = ?`,
            [postid]
        );

        await pool.query(
            `DELETE FROM posts WHERE id = ?;`,
            [postid]
        );

        res.status(200).json({
            message: "Post deleted succesfully"
        });

    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    uploadPost,
    getPosts,
    likePost,
    getLikedPosts,
    unlikePost,
    getPost,
    getUserPosts,
    deletePost
};
