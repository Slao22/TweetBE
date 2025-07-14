import { Router } from "express"
import { loginValidation, registerValidation } from "../middlewares/users.middlewares"
import { loginController, registerController } from "~/controllers/users.controller"
const usersRouter = Router()

usersRouter.post("/login", loginValidation, loginController)
usersRouter.post("/register", registerValidation, registerController)

export default usersRouter
