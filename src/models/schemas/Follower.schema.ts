import { ObjectId } from "mongodb"

interface FollowerType {
  _id?: ObjectId
  userId: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  followed_user_id: ObjectId
  created_at: Date
  userId: ObjectId

  constructor({ _id, followed_user_id, created_at, userId }: FollowerType) {
    this._id = _id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
    this.userId = userId
  }
}
