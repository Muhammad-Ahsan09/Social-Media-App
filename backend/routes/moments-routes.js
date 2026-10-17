import express from "express"
import authMiddleware from "../middlewares/authmiddleware.js";
import multer from "multer";
import { createMoment, getMoments } from "../controllers/moments-controllers.js";


const storage = multer.memoryStorage()
const upload = multer({storage})

const momentsRouter = express.Router()

momentsRouter.post("/", authMiddleware, upload.single("file"), createMoment)
momentsRouter.get("/", authMiddleware, getMoments)

export default momentsRouter;