import { config } from "dotenv"
import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { result } from "lodash"
import { ObjectId } from "mongodb"
import { access } from "node:fs"
import { UserVerifyStatus } from "~/constants/enums"
import HTTP_STATUS from "~/constants/httpStatus"
import { USER_MESSAGES } from "~/constants/messages"
import {
  ChangePasswordReqBody,
  FollowRequestBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowRequestParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from "~/models/requests/User.requests"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.service"
import usersService from "~/services/users.service"
config()
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const userId = user._id as ObjectId
  const result = await usersService.login({ userId: userId.toString(), verify: user.verify })
  const { accessToken, refreshToken } = result
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 phút
  })

  // Set refresh token cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
  })
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // const { refresh_token } = req.body
  const refresh_token = req.cookies.refresh_token
  if (!refresh_token) {
    return res.status(400).json({ message: "No refresh token found" })
  }
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "lax"
  })

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax"
  })

  const result = await usersService.logout(refresh_token)
  return res.json(result)
}

export const refreshTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const refresh_token = req.cookies.refresh_token
  if (!refresh_token) {
    return res.status(401).json({ message: "No refresh token provided" })
  }
  const { userId, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ userId, verify, refresh_token, exp })
  const { access_token, refresh_token: new_refresh_token } = result
  res.cookie("access_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 phút
  })

  // Set refresh token cookie
  res.cookie("refresh_token", new_refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
  })
  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decode_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  // if user not found
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // Verified then don't throw error
  // return status OK with message is verified
  if (user.email_verify_token === "") {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await usersService.verifyEmail(userId)
  res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await usersService.resendVerifyEmail(userId)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({
    userId: (_id as ObjectId).toString(),
    verify
  })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({ message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(userId, password)
  return res.json(result)
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(userId)
  return res.json({ message: USER_MESSAGES.GET_ME_SUCCESS, result: user })
}
export const getProfileController = async (req: Request<{ username: string }>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({ message: USER_MESSAGES.GET_PROFILE_SUCCESS, result: user })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(userId, followed_user_id)
  return res.json(result)
}

export const deleteFollowController = async (
  req: Request<UnFollowRequestParams>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { userId: followed_user_id } = req.params
  const result = await usersService.deleteFollow(userId, followed_user_id)
  return res.json(result)
}

export const updatedMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await usersService.updateMe(userId, body)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(userId, password)
  return res.json(result)
}

export const oAuthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  const result = await usersService.oAuth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK as string}?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&new_user=${result.newUser}`
  return res.redirect(urlRedirect)
}
