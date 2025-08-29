import express from "express"
import dotenv from "dotenv/config"
import ConnectDb from "./config/db.js"
import auth from "./routes/auth.Routes/auth.routes.js"
import cookieParser from "cookie-parser"
import session from "express-session"
import multer from "multer"
import Manager from "./routes/manager-Routes/manager.routes.js"
import verifyToken from "./middleware/auth.middleware.js"
import checkRole from "./middleware/role.middleware.js"
import Admin from "./routes/Admin-Routes/admin.routes.js"
import user from "./routes/User-Routes/user.routes.js"
import checkManager from "./middleware/approved.middleware.js"
import cors from "cors"
// import { verify } from "jsonwebtoken"

//Connecting to the port 
const PORT = process.env.PORT

//Initialize Express
const app = express()
const upload = multer()

//Middleware 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(session({
    secret:process.env.JWT_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false,httpOnly: true,maxAge:10*24*60*60*1000}
}))
app.use(cors({
    origin: process.env.Target_API, // replace with your frontend URL
    credentials: true,               // allow cookies and headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

//Defining routes 
//Auth Routes
app.use("/api/auth",auth)
//Now Role base routes 
//Admin
app.use("/api/admin",verifyToken,checkRole("admin"),Admin)
//Manger
app.use("/api/manager",verifyToken,checkRole("manager","admin"),checkManager,Manager)
//User Routes
app.use("/api/user",verifyToken,checkRole("user"),user)


app.listen(PORT,()=>{
    ConnectDb()
    console.log(`The Sever has started on ${PORT}`);
})