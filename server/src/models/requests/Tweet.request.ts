import { ParamsDictionary, Query } from "express-serve-static-core"
import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "~/models/Other"

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: string
  hashtags?: string[]
  mentions: string[]
  medias: Media[]
}

export interface TweetParam extends ParamsDictionary {
  tweetId: string
}

export interface TweetQuery extends Query {
  limit: string
  page: string
  tweet_type: string
}
