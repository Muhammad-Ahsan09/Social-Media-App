
const express = require("express");
const sceneRouter = express.Router();

const {
    createScene,
    getScenes,
    deleteScene,
} = require("../controllers/scene-controllers");


const {
    getSceneComments,
    createSceneComment
} = require("../controllers/scene-comments-controllers");


const multer = require("multer");
const { default: authMiddleware } = require("../middlewares/authmiddleware");
const { likeScene, unlikeScene } = require("../controllers/scene-likes-controllers");


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


sceneRouter.post("/:sceneId/like", authMiddleware, likeScene);
sceneRouter.delete("/:sceneId/like", authMiddleware, unlikeScene);


sceneRouter.get(
    "/:sceneId/comments",
    authMiddleware,
    getSceneComments
);

sceneRouter.post(
    "/:sceneId/comments",
    authMiddleware,
    createSceneComment
);

module.exports = sceneRouter;
