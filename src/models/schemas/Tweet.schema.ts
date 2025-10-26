import { ObjectId } from "mongodb"
import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "~/models/Other"

interface TweetConstructor {
  _id?: ObjectId
  userId: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parentId: ObjectId | null
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  userId: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parentId: ObjectId | null
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at?: Date
  updated_at?: Date
  constructor({
    _id,
    audience,
    content,
    guest_views,
    hashtags,
    medias,
    mentions,
    parentId,
    type,
    userId,
    user_views,
    created_at,
    updated_at
  }: TweetConstructor) {
    const date = new Date()
    this._id = _id
    this.userId = userId
    this.type = type
    this.audience = audience
    this.content = content
    this.parentId = parentId
    this.hashtags = hashtags
    this.mentions = mentions
    this.medias = medias
    this.guest_views = guest_views
    this.user_views = user_views
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
