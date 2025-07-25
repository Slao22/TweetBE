import express from "express"
import { defaultErrorHandler } from "~/middlewares/error.middlewares"
import usersRouter from "~/routes/users.routes"
import databaseService from "~/services/database.service"
const app = express()
const PORT = 3000
databaseService.connect().catch(console.dir) // Initialize the database connection
app.use(express.json()) // Middleware to parse JSON bodies
app.use("/user", usersRouter)
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
