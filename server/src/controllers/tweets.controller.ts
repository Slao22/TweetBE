import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TweetType } from "~/constants/enums"
import { TweetParam, TweetQuery, TweetReqBody } from "~/models/requests/Tweet.request"
import { TokenPayload } from "~/models/requests/User.requests"
import tweetService from "~/services/tweets.service"

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(userId, req.body)
  return res.json({
    message: "Tweet created successfully",
    result
  })
}
export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweetId, req.decoded_authorization?.userId)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: "Tweet retrieved successfully",
    result: tweet
  })
}
export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const userId = req.decoded_authorization?.userId
  const { total, tweets } = await tweetService.getTweetChildren({
    tweetId: req.params.tweetId,
    tweet_type,
    limit,
    page,
    userId
  })
  return res.json({
    message: "Tweet children successfully",
    tweet_type,
    limit,
    page,
    total_page: Math.ceil(total / limit),
    tweets
  })
}
