const sharp = require("sharp");
const streamifier = require('streamifier');
const { randomUUID } = require("crypto");
const path = require("path");


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


const uploadToR2 = async (file, folder = "journeys/covers") => {
    if (!file) return null;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Unsupported media type");
    }

    let buffer = file.buffer;

    // Optimize images, but don't process videos through Sharp.
    if (file.mimetype.startsWith("image/")) {
        buffer = await sharp(file.buffer)
            .rotate()
            .resize({
                width: 1200,
                withoutEnlargement: true,
            })
            .toBuffer();
    }

    const extension = path.extname(file.originalname).toLowerCase();

    const key = `${folder.replace(/^\/+|\/+$/g, "")}/${randomUUID()}${extension}`;

    await R2.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.mimetype,
        })
    );

    return {
        url: `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${key}`,
        key,
    };
};


const deleteFromR2 = async (file) => {
    if (!file) return;

    try {
        let key;

        // If a public URL is provided, extract its object key.
        if (file.startsWith("http://") || file.startsWith("https://")) {
            const publicUrl = new URL(R2_PUBLIC_URL);
            const targetUrl = new URL(file);

            // Don't delete files hosted elsewhere.
            if (targetUrl.origin !== publicUrl.origin) return;

            const basePath = publicUrl.pathname.replace(/\/+$/, "");

            if (
                basePath &&
                !targetUrl.pathname.startsWith(`${basePath}/`)
            ) {
                return;
            }

            key = decodeURIComponent(
                targetUrl.pathname
                    .slice(basePath.length)
                    .replace(/^\/+/, "")
            );

        } else {
            // Otherwise, use the provided object key directly.
            key = file;
        }

        if (!key || key.includes("..") || key.startsWith("/")) return;

        await R2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
            })
        );

    } catch (error) {
        console.error("R2 Delete Error:", error);
    }
};

module.exports = {uploadToR2, deleteFromR2}