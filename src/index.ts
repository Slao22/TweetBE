import express from "express"
import { sum } from "./utils"
const app = express()
const PORT = 3000

app.get("/", (req, res) => {
  const value = sum({ a: 1, b: 2 })
  res.send("Hello World" + value)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
