import { config } from "dotenv"
import express from "express"
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
config()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
})
const app = express()
const PORT = process.env.PORT || 4000
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
