import { Router } from "express"
import { bookmarkTweetController, unBookmarkTweetController } from "~/controllers/bookmarks.controller"
import { tweetIdValidator } from "~/middlewares/tweets.middleware"

import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const bookmarksRouter = Router()

bookmarksRouter.post(
  "/",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)
bookmarksRouter.delete(
  "/tweets/:tweetId",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkTweetController)
)
export default bookmarksRouter
