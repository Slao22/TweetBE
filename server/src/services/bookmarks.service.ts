import { ObjectId } from "mongodb"
import Bookmark from "~/models/schemas/Bookmark.schema"
import databaseService from "~/services/database.service"

class BookmarkService {
  async bookmarkTweet(userId: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      { userId: new ObjectId(userId), tweetId: new ObjectId(tweetId) },
      { $setOnInsert: new Bookmark({ userId: new ObjectId(userId), tweetId: new ObjectId(tweetId) }) },
      { upsert: true, returnDocument: "after" }
    )
    return result
  }
  async unBookmarkTweet(userId: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      userId: new ObjectId(userId),
      tweetId: new ObjectId(tweetId)
    })
    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
