
import { connectToDatabase, closeDatabaseConnection } from './db';
import { bookController } from './controllers/bookController';
import { userController } from './controllers/userController';
import { borrowController } from './controllers/borrowController';
import { authMiddleware } from './middleware/auth';

// Initialize the MongoDB connection
export async function initializeDatabase() {
  try {
    await connectToDatabase();
    console.log("MongoDB database initialized successfully");
    
    // Optionally, you could seed the database here if it's empty
    // await seedDatabase();
    
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
}

// Export controllers for use in the application
export {
  bookController,
  userController,
  borrowController,
  authMiddleware,
  closeDatabaseConnection
};

// Optional: Database seeding function for initial development setup
async function seedDatabase() {
  const { booksCollection, usersCollection } = await connectToDatabase();
  
  // Check if database is already seeded
  const booksCount = await booksCollection.countDocuments();
  const usersCount = await usersCollection.countDocuments();
  
  if (booksCount > 0 || usersCount > 0) {
    console.log("Database already has data, skipping seeding");
    return;
  }
  
  console.log("Seeding database with initial data...");
  
  // Create initial admin user
  await userController.register(
    "Admin User",
    "admin@library.com",
    "admin123"
  );
  
  // Update the admin user's role
  const adminUser = await usersCollection.findOne({ email: "admin@library.com" });
  if (adminUser) {
    await usersCollection.updateOne(
      { _id: adminUser._id },
      { $set: { role: "admin" } }
    );
  }
  
  // Create librarian user
  await userController.register(
    "Librarian User",
    "librarian@library.com",
    "librarian123"
  );
  
  // Update the librarian user's role
  const librarianUser = await usersCollection.findOne({ email: "librarian@library.com" });
  if (librarianUser) {
    await usersCollection.updateOne(
      { _id: librarianUser._id },
      { $set: { role: "librarian" } }
    );
  }
  
  // Create regular user
  await userController.register(
    "Regular User",
    "user@library.com",
    "user123"
  );
  
  // Add sample books
  const sampleBooks = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0446310789",
      publishedYear: 1960,
      genre: "Classic",
      description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0451524935",
      publishedYear: 1949,
      genre: "Dystopian",
      description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0743273565",
      publishedYear: 1925,
      genre: "Classic",
      description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career.",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg",
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0141439518",
      publishedYear: 1813,
      genre: "Romance",
      description: "Few have failed to be charmed by the witty and independent spirit of Elizabeth Bennet in Austen's beloved classic Pride and Prejudice.",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/17/PrideAndPrejudiceTitlePage.jpg",
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "978-0547928227",
      publishedYear: 1937,
      genre: "Fantasy",
      description: "A glorious account of a magnificent adventure, filled with suspense and seasoned with a quiet humor that is irresistible.",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg",
    }
  ];
  
  for (const bookData of sampleBooks) {
    await bookController.addBook(bookData);
  }
  
  console.log("Database seeding completed");
}

// Optionally setup automatic checking for overdue books
// This would typically be done with a cron job in a real application
export function scheduleOverdueCheck() {
  // Run the check immediately
  borrowController.checkOverdueBooks();
  
  // Then set up a daily check (24 hours)
  setInterval(() => {
    borrowController.checkOverdueBooks();
  }, 24 * 60 * 60 * 1000);
}
