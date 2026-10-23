
const express = require("express");
const sceneRouter = express.Router();

const {
    createScene,
    getScenes,
    deleteScene,
} = require("../controllers/scene-controllers");

const multer = require("multer");
const { default: authMiddleware } = require("../middlewares/authmiddleware");


const storage = multer.memoryStorage()
const upload = multer({storage})

// Fetch scenes for the feed
sceneRouter.get("/", authMiddleware, getScenes);

// Upload a video and create a scene
sceneRouter.post(
    "/",
    authMiddleware,
    upload.single("file"),
    createScene
);

// Delete a scene owned by the authenticated user
sceneRouter.delete("/:sceneId", authMiddleware, deleteScene);

module.exports = sceneRouter;
