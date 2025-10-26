import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/constants/enums"
import { TWEETS_MESSAGES } from "~/constants/messages"
import { numberEnumToArray } from "~/utils/common"
import { validate } from "~/utils/validation"
const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetTypes]
      },
      errorMessage: TWEETS_MESSAGES.INVALID_TYPE
    },
    audience: {
      isIn: {
        options: [tweetAudiences]
      },
      errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // neu type la retweet,comment,quotetweet thi parent_id la tweet_id cua tweet cha
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            if (!value) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }
          }
          // neu type la tweet thi parent_id phai la null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]

          // neu type la retweet,comment,quotetweet, tweet va khong co mentions va hastags thi content phai la string va khong duoc rong
          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ""
          ) {
            if (!value) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }
          }
          // neu type la retweet thi parent_id phai la " "
          if (type === TweetType.Retweet && value !== "") {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },

    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //yeu cau moi phan tu trong array la string
          if (value.some((item: any) => typeof item !== "string")) {
            throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_ARRAY_OF_STRINGS)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //yeu cau moi phan tu trong array la user id (objectId)
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_ARRAY_OF_USER_IDS)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          //yeu cau moi phan tu trong array la MEDIA OBJECT
          if (
            value.some((item: any) => {
              return typeof item.url !== "string" || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECTS)
          }
          return true
        }
      }
    }
  })
)
