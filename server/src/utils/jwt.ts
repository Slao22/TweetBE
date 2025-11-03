import jwt from "jsonwebtoken"
import { TokenPayload } from "~/models/requests/User.requests"

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: "HS256"
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        throw rejects(err)
      }
      return resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
