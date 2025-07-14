import { TokenType } from "~/constants/enums"
import { RegisterReqBody } from "~/models/requests/User.requests"
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
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.RefreshToken
      },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    // Return the user object with tokens
    console.log("Access token expires in:", process.env.ACCESS_TOKEN_EXPIRES_IN)

    return { accessToken, refreshToken }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return !!user
  }
  // async checkUsernameExists(username: string) {
  //   const user = await databaseService.users.findOne({ username })
  //   return !!user
  // }
}

const usersService = new UsersService()
export default usersService
