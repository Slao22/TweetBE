import { ObjectId } from "mongodb"

interface BookmarkType {
  _id?: ObjectId
  userId: ObjectId
  tweetId: ObjectId
  created_at?: Date
}

export default class Bookmark {
  _id?: ObjectId
  userId: ObjectId
  tweetId: ObjectId
  created_at?: Date
  constructor({ _id, userId, tweetId, created_at }: BookmarkType) {
    this._id = _id || new ObjectId()
    this.userId = userId
    this.tweetId = tweetId
    this.created_at = created_at || new Date()
  }
}
