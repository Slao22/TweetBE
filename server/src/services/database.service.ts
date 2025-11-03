import { Collection, Db, MongoClient } from "mongodb"
import { config } from "dotenv"
import User from "~/models/schemas/User.schema"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import Follower from "~/models/schemas/Follower.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import Hashtag from "~/models/schemas/Hashtag.schema"
import Bookmark from "~/models/schemas/Bookmark.schema"
import Like from "~/models/schemas/Like.schema"
config() // Load environment variables from .env file
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@x.ihuhydf.mongodb.net/?retryWrites=true&w=majority&appName=X`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log("Pinged your deployment. You successfully connected to MongoDB!")
    } catch (error) {
      throw new Error("Failed to connect to the database: " + error)
    }
  }
  async indexUsers() {
    const exists = await this.users.indexExists(["email_1_password_1", "email_1", "username_1"])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(["token_1", "exp_1"])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  async indexFollowers() {
    const exists = await this.followers.indexExists(["userId_1", "followedUserId_1"])
    if (!exists) {
      this.followers.createIndex({ userId: 1, followedUserId: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_COLLECTION_TWEETS as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_COLLECTION_HASHTAGS as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_COLLECTION_BOOKMARKS as string)
  }
  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_COLLECTION_LIKES as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKENS as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_COLLECTION_FOLLOWERS as string)
  }
}

// create new object from class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
