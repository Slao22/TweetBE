import { create } from "lodash"
import { ObjectId } from "mongodb"
import { TokenType, UserVerifyStatus } from "~/constants/enums"
import HTTP_STATUS from "~/constants/httpStatus"
import { USER_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/Errors"
import { RegisterReqBody, UpdateMeReqBody } from "~/models/requests/User.requests"
import Follower from "~/models/schemas/Follower.schema"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.service"
import { hashPassword } from "~/utils/crypto"
import { signToken } from "~/utils/jwt"
import axios from "axios"
import { verify } from "crypto"
class UsersService {
  private signAccessToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }
  private signEmailVerifyToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }
  private signForgotPasswordToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }
  private signAccessAndRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ userId, verify }), this.signRefreshToken({ userId, verify })])
  }

  async register(payload: RegisterReqBody) {
    const userId = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: userId,
        email_verify_token,
        username: `user${userId.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    databaseService.refreshTokens.insertOne(new RefreshToken({ userId: new ObjectId(userId), token: refreshToken }))
    return { accessToken, refreshToken }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return !!user
  }

  async login({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId,
      verify
    })
    databaseService.refreshTokens.insertOne(new RefreshToken({ userId: new ObjectId(userId), token: refreshToken }))

    return { accessToken, refreshToken }
  }

  private async getOAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    }
    const { data } = await axios.post("https://oauth2.googleapis.com/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
      params: {
        access_token,
        alt: "json"
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oAuth(code: string) {
    const { id_token, access_token } = await this.getOAuthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.UNAUTHORIZED, message: USER_MESSAGES.GMAIL_NOT_VERIFIED_GOOGLE })
    }
    // check email exists in db
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      // login
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
        userId: user._id.toString(),
        verify: user.verify
      })
      databaseService.refreshTokens.insertOne(new RefreshToken({ userId: user._id, token: refreshToken }))
      return { accessToken, refreshToken, newUser: 0, verify: user.verify }
    } else {
      const passwordRandom = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password: passwordRandom,
        confirm_password: passwordRandom
      })
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESSFULLY
    }
  }
  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ userId, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: { email_verify_token: "", verify: UserVerifyStatus.Verified },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(userId: string) {
    const email_verify_token = await this.signEmailVerifyToken({ userId, verify: UserVerifyStatus.Unverified })
    //send email
    console.log("Resend email", email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
  async forgotPassword({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ userId, verify })
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    //send email : https://....forgot-password?token=token
    console.log("token", forgot_password_token)
    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(userId: string, password: string) {
    databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgot_password_token: "",
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async getMe(userId: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async updateMe(userId: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: "after", projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null)
      throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: USER_MESSAGES.USER_NOT_FOUND })
    return user
  }
  async follow(userId: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      userId: new ObjectId(userId),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ALREADY_FOLLOWING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    await databaseService.followers.insertOne(
      new Follower({ userId: new ObjectId(userId), followed_user_id: new ObjectId(followed_user_id) })
    )
    return { message: USER_MESSAGES.FOLLOW_SUCCESS }
  }
  async deleteFollow(userId: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      userId: new ObjectId(userId),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (!follower) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.INVALID_ID_FOLLOWED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    await databaseService.followers.deleteOne({
      userId: new ObjectId(userId),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return { message: USER_MESSAGES.UNFOLLOW_SUCCESS }
  }
  async changePassword(userId: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return { message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS }
  }
}

const usersService = new UsersService()
export default usersService
