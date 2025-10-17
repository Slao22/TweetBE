import express from "express"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import mediasRouter from "~/routes/media.routes"
import usersRouter from "~/routes/users.routes"
import databaseService from "~/services/database.service"
import { initFolder } from "~/utils/file"
const app = express()
const PORT = 4000
databaseService.connect().catch(console.dir) // Initialize the database connection
initFolder() // Initialize necessary folders
app.use(express.json()) // Middleware to parse JSON bodies
app.use("/user", usersRouter)
app.use("/medias", mediasRouter)
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
