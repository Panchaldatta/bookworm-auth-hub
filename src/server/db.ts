
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { Book, User, BorrowRecord } from '@/types';

// Connection string - in real app, this would be in .env file
const uri = "mongodb://localhost:27017";
// For production, use a real MongoDB connection string:
// const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections
const db = client.db("librarySystem");
const booksCollection = db.collection<Book>("books");
const usersCollection = db.collection<User>("users");
const borrowRecordsCollection = db.collection<BorrowRecord>("borrowRecords");

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return { db, booksCollection, usersCollection, borrowRecordsCollection };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Helper function to convert string ID to ObjectId
export const toObjectId = (id: string) => new ObjectId(id);

// Close connection
export async function closeDatabaseConnection() {
  await client.close();
  console.log("MongoDB connection closed");
}
