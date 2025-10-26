import { Router } from "express"
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from "../middlewares/users.middlewares"
import {
  changePasswordController,
  deleteFollowController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oAuthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updatedMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from "~/controllers/users.controller"
import { wrapRequestHandler } from "~/utils/handlers"
import { filterMiddleware } from "~/middlewares/common.middleware"
import { UpdateMeReqBody } from "~/models/requests/User.requests"
const usersRouter = Router()

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))

usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post("/refresh-token", refreshTokenValidator, wrapRequestHandler(refreshTokenController))
usersRouter.post("/verify-email", emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  "/verify-forgot-password",
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post("/reset-password", resetPasswordValidator, wrapRequestHandler(resetPasswordController))

usersRouter.get("/me", accessTokenValidator, wrapRequestHandler(getMeController))

usersRouter.patch(
  "/me",
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    "name",
    "date_of_birth",
    "bio",
    "location",
    "website",
    "username",
    "avatar",
    "cover_photo"
  ]),
  wrapRequestHandler(updatedMeController)
)

usersRouter.get("/:username", wrapRequestHandler(getProfileController))
usersRouter.post(
  "/follow",
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

usersRouter.delete(
  "/follow/:userId",
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(deleteFollowController)
)

usersRouter.put(
  "/change-password",
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

usersRouter.get("/oauth/google", wrapRequestHandler(oAuthController))

export default usersRouter
