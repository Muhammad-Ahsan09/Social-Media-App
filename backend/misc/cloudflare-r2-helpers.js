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



const uploadToR2 = async (file) => {
    if (!file) return null;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Journey cover must be JPEG, PNG or WebP");
    }

    // Optimize image while preserving its original format.
    const optimizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize({
            width: 1200,
            withoutEnlargement: true,
        })
        .toBuffer();

    const extension = path.extname(file.originalname).toLowerCase();

    const key = `journeys/covers/${randomUUID()}${extension}`;

    await R2.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: optimizedBuffer,
            ContentType: file.mimetype,
        })
    );

    return {
        url: `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${key}`,
        key,
    };
};


const deleteFromR2 = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        const publicUrl = new URL(R2_PUBLIC_URL);
        const targetUrl = new URL(fileUrl);

        // Don't accidentally delete files hosted elsewhere.
        if (targetUrl.origin !== publicUrl.origin) return;

        const basePath = publicUrl.pathname.replace(/\/+$/, "");

        if (
            basePath &&
            !targetUrl.pathname.startsWith(`${basePath}/`)
        ) {
            return;
        }

        const key = decodeURIComponent(
            targetUrl.pathname
                .slice(basePath.length)
                .replace(/^\/+/, "")
        );

        if (!key) return;

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