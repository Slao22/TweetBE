import { ObjectId } from "mongodb"

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  userId: ObjectId
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  userId: ObjectId

  constructor({ _id, token, created_at, userId }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.userId = userId
  }
}
