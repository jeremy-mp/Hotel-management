import express from "express"
import { getProfileDetails, login, logout, register, UpdateProfile } from "../../controller/auth.controller.js"
import uploadMiddleware from "../../middleware/uploadMiddleware.js"
import verifyToken from "../../middleware/auth.middleware.js"
import multer from "multer"

const auth = express.Router()
const upload = multer()

auth.post("/register",uploadMiddleware.single("image"),register)

auth.post("/login",login)

auth.get("/profile",getProfileDetails)

auth.post("/profile/:id",verifyToken,uploadMiddleware.single("image"),UpdateProfile)

auth.post("/logout",logout)

export default auth 