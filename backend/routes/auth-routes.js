import { login, logout, signup } from "../controllers/auth-controllers.js"

import express from "express"


const authRouter = express.Router()

authRouter.post("/signup", signup)
authRouter.post("/login", login)
authRouter.post("/logout", logout)

export default authRouter;