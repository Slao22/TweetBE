import { NextFunction, Request, Response } from "express"
import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums"
import HTTP_STATUS from "~/constants/httpStatus"
import { TWEETS_MESSAGES, USER_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/Errors"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.service"
import { numberEnumToArray } from "~/utils/common"
import { wrapRequestHandler } from "~/utils/handlers"
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

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweetId: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({ message: TWEETS_MESSAGES.INVALID_TWEET_ID, status: HTTP_STATUS.BAD_REQUEST })
            }
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: "hashtags",
                    localField: "hashtags",
                    foreignField: "_id",
                    as: "hashtags"
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "mentions",
                    foreignField: "_id",
                    as: "mentions"
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: "$mentions",
                        as: "mention",
                        in: {
                          _id: "$$mention._id",
                          name: "$$mention.name",
                          username: "$$mention.username",
                          email: "$$mention.email"
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "tweetId",
                    as: "bookmarks"
                  }
                },
                {
                  $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweetId",
                    as: "likes"
                  }
                },
                {
                  $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "parentId",
                    as: "tweet_children"
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: "$bookmarks"
                    },
                    likes: {
                      $size: "$likes"
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: "$tweet_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", TweetType.QuoteTweet]
                          }
                        }
                      }
                    },
                    view: {
                      $add: ["$user_views", "$guest_views"]
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()
            if (!tweet) {
              throw new ErrorWithStatus({ message: TWEETS_MESSAGES.TWEET_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ["params", "body"]
  )
)
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // kiem tra dang nhap hay chua
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    // kiem tra tai khoan nguoi xem co bi khoa hay bi xoa khong
    const author = await databaseService.users.findOne({ _id: new ObjectId(tweet.userId) })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // kiem tra nguoi xem tweet co trong twitter circle cua tac gia hay khong
    const { userId } = req.decoded_authorization
    const isInTwitterCircle = author.tweet_circle?.some((user_circle_id) => user_circle_id.equals(userId))
    // neu khong phai tac gia va khong nam trong tweet circle
    if (!isInTwitterCircle && !author._id.equals(userId)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})
export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error("1 <= limit <= 100")
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error("page >= 1")
            }
            return true
          }
        }
      }
    },
    ["query"]
  )
)
