import express from "express"
import { deletePost, getPost, getPosts, likePost, unlikePost, uploadPost } from "../controllers/posts-contoller.js"
import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({storage})

const postsRouter = express.Router()


postsRouter.post("/", upload.single("file"), uploadPost)
postsRouter.get("/", getPosts)
postsRouter.get("/:post_id", getPost)
postsRouter.delete("/:postid", deletePost)
postsRouter.patch("/like/:postid/:userid", likePost)
postsRouter.patch("/unlike/:postid/:userid", unlikePost)

export default postsRouter;

// app.post("/api/posts", upload.single("file"),  uploadPost)


// app.get("/api/posts" , getPosts)
// app.get("/api/posts/:post_id", getPost)
// app.delete("/api/posts/:postid", deletePost)
// app.patch("/api/posts/like/:postid/:userid", likePost)
// app.patch("/api/posts/unlike/:postid/:userid", unlikePost)