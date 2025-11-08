import { config } from "dotenv"
import express from "express"
import cors from "cors"
import { UPLOAD_VIDEO_DIR } from "~/constants/dir"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import bookmarksRouter from "~/routes/bookmarks.routes"
import likeRouter from "~/routes/likes.routes"
import mediasRouter from "~/routes/media.routes"
import staticRouter from "~/routes/static.routes"
import tweetRouter from "~/routes/tweet.routes"
import usersRouter from "~/routes/users.routes"
import databaseService from "~/services/database.service"
import { initFolder } from "~/utils/file"
import cookieParser from "cookie-parser"

config()
const allowedOrigins = [
  "http://localhost:3000", // ✅ dev frontend (Next.js)
  "https://yourapp.vercel.app", // ✅ production frontend (Vercel)
  "https://yourapp.com" // ✅ domain chính thức
]
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})
const app = express()
app.use(cookieParser())
const PORT = process.env.PORT || 4000

// Cấu hình CORS động
app.use(
  cors({
    origin: (origin: any, callback: any) => {
      // Cho phép request không có origin (VD: Postman, server-to-server)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("❌ Not allowed by CORS"))
      }
    },
    credentials: false // nếu dùng cookie / auth header thi chuyển thành true
  })
)
initFolder() // Initialize necessary folders
app.use(express.json()) // Middleware to parse JSON bodies
app.use("/user", usersRouter)
app.use("/medias", mediasRouter)
app.use("/static", staticRouter)
app.use("/tweets", tweetRouter)
app.use("/bookmarks", bookmarksRouter)
app.use("/likes", likeRouter)
app.use("/static/video", express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
