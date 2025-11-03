import { ObjectId } from "mongodb"

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  userId: ObjectId
  exp: number
  iat: number
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  userId: ObjectId
  exp: Date
  iat: Date

  constructor({ _id, token, created_at, userId, exp, iat }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.userId = userId
    this.exp = new Date(exp * 1000)
    this.iat = new Date(iat * 1000)
  }
}
