import { ObjectId } from "mongodb"

interface LikeType {
  _id?: ObjectId
  userId: ObjectId
  tweetId: ObjectId
  created_at?: Date
}

export default class Like {
  _id?: ObjectId
  userId: ObjectId
  tweetId: ObjectId
  created_at?: Date
  constructor({ _id, userId, tweetId, created_at }: LikeType) {
    this._id = _id
    this.userId = userId
    this.tweetId = tweetId
    this.created_at = created_at || new Date()
  }
}
