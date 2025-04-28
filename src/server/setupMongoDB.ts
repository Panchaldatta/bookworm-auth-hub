
import { MongoClient, ServerApiVersion } from 'mongodb';

// This script can be run once to set up MongoDB indexes and initial settings

async function setupMongoDB() {
  console.log("Setting up MongoDB...");
  
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("librarySystem");
    
    // Create collections if they don't exist
    await db.createCollection("books");
    await db.createCollection("users");
    await db.createCollection("borrowRecords");
    
    console.log("Collections created");
    
    // Create indexes for better query performance
    await db.collection("books").createIndex({ title: 1 });
    await db.collection("books").createIndex({ author: 1 });
    await db.collection("books").createIndex({ genre: 1 });
    await db.collection("books").createIndex({ available: 1 });
    
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ role: 1 });
    
    await db.collection("borrowRecords").createIndex({ userId: 1 });
    await db.collection("borrowRecords").createIndex({ bookId: 1 });
    await db.collection("borrowRecords").createIndex({ status: 1 });
    await db.collection("borrowRecords").createIndex({ dueDate: 1 });
    
    console.log("Indexes created successfully");
    
    console.log("MongoDB setup completed");
  } catch (error) {
    console.error("Error setting up MongoDB:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the setup function
setupMongoDB();
