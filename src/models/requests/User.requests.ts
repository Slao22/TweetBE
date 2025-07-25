import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enums"
export interface LoginReqBody {
  email: string
  password: string
}
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
export interface ForgotPasswordReqBody {
  email: string
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}
export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
export interface TokenPayload extends JwtPayload {
  userId: string
  token_type: TokenType
}

export interface LogoutReqBody {
  refresh_token: string
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
