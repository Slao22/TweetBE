import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { BOOKMARK_MESSAGES } from "~/constants/messages"
import { BookmarkReqBody } from "~/models/requests/Bookmark.request"
import { TokenPayload } from "~/models/requests/User.requests"
import bookmarkService from "~/services/bookmarks.service"

export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(userId, req.body.tweetId)
  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESS,
    result
  })
}

export const unBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkReqBody>,
  res: Response
) => {
  const { userId } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unBookmarkTweet(userId, req.params.tweetId)
  return res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESS,
    result
  })
}
