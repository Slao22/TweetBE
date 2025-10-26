import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "~/models/Other"

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id?: string
  hashtags?: string[]
  mentions?: string[]
  medias?: Media[]
}
