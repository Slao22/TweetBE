import { Router } from "express"
import {
  accessTokenValidaton,
  loginValidation,
  refreshTokenValidator,
  registerValidation
} from "../middlewares/users.middlewares"
import { loginController, registerController } from "~/controllers/users.controller"
import { wrapRequestHandler } from "~/utils/handlers"
const usersRouter = Router()

usersRouter.post("/login", loginValidation, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidation, wrapRequestHandler(registerController))

usersRouter.post(
  "/logout",
  accessTokenValidaton,
  refreshTokenValidator,
  wrapRequestHandler((req, res) => {
    res.json()
  })
)

export default usersRouter
