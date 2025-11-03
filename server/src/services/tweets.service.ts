import { Hash } from "crypto"
import { update } from "lodash"
import { ObjectId, WithId } from "mongodb"
import { TweetType } from "~/constants/enums"
import { TweetReqBody } from "~/models/requests/Tweet.request"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.service"

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map(async (hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: "after" }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => hashtag?._id as ObjectId)
  }
  async createTweet(userId: string, body: TweetReqBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags || [])
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parentId: body.parent_id,
        type: body.type,
        userId: new ObjectId(userId)
      })
    )
    return result
  }
  async increaseView(tweetId: string, userId?: string) {
    const inc = userId ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweetId)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: "after",
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }
  async getTweetChildren({
    tweetId,
    tweet_type,
    page,
    limit,
    userId
  }: {
    tweetId: string
    tweet_type: TweetType
    page: number
    limit: number
    userId?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parentId: new ObjectId(tweetId),
            type: tweet_type
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
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = userId ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: { $in: ids }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parentId: new ObjectId(tweetId),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (userId) {
        tweet.user_views! += 1
      } else {
        tweet.guest_views! += 1
      }
    })
    return { tweets, total }
  }
}

const tweetService = new TweetService()
export default tweetService
