import { ObjectId } from "mongodb"
import { TokenType, UserVerifyStatus } from "~/constants/enums"
import { USER_MESSAGES } from "~/constants/messages"
import { RegisterReqBody } from "~/models/requests/User.requests"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.service"
import { hashPassword } from "~/utils/crypto"
import { signToken } from "~/utils/jwt"

class UsersService {
  private signAccessToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }
  private signEmailVerifyToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }
  private signAccessAndRefreshToken(userId: string) {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
  }

  async register(payload: RegisterReqBody) {
    const userId = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(userId.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: userId,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(userId.toString())
    databaseService.refreshTokens.insertOne(new RefreshToken({ userId: new ObjectId(userId), token: refreshToken }))
    return { accessToken, refreshToken }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return !!user
  }

  async login(userId: string) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(userId)
    databaseService.refreshTokens.insertOne(new RefreshToken({ userId: new ObjectId(userId), token: refreshToken }))

    return { accessToken, refreshToken }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESSFULLY
    }
  }
  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(userId),
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
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(userId: string) {
    const email_verify_token = await this.signEmailVerifyToken(userId)
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
}

const usersService = new UsersService()
export default usersService
