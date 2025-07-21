import { Router } from "express"
import {
  accessTokenValidation,
  emailVerifyToken,
  loginValidation,
  refreshTokenValidator,
  registerValidation
} from "../middlewares/users.middlewares"
import {
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController
} from "~/controllers/users.controller"
import { wrapRequestHandler } from "~/utils/handlers"
const usersRouter = Router()

usersRouter.post("/login", loginValidation, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidation, wrapRequestHandler(registerController))

usersRouter.post("/logout", accessTokenValidation, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post("/verify-email", emailVerifyToken, wrapRequestHandler(verifyEmailController))
usersRouter.post("/resend-verify-email", accessTokenValidation, wrapRequestHandler(resendVerifyEmailController))
export default usersRouter
