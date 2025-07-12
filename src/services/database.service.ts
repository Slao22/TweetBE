import { Collection, Db, MongoClient } from "mongodb"
import { config } from "dotenv"
import User from "~/models/schemas/User.schema"
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
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }
}

// create new object from class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
