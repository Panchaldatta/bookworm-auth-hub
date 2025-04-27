
import { Book, User, UserResponse } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Base API URL - typically would be an environment variable
const API_URL = "https://api.yourlibrary.com";

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const message = error.message || "An error occurred. Please try again.";
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  return { error: message };
};

// Mock authentication functions (would connect to MongoDB in production)
export const authApi = {
  async login(email: string, password: string) {
    try {
      // In production, this would be a real API call
      if (email === "admin@library.com" && password === "admin123") {
        const user: UserResponse = {
          _id: "admin-id-123",
          name: "Admin User",
          email: "admin@library.com",
          role: "admin",
        };
        
        return { user, token: "mock-token-admin-123" };
      }
      
      if (email === "user@library.com" && password === "user123") {
        const user: UserResponse = {
          _id: "user-id-456",
          name: "Regular User",
          email: "user@library.com",
          role: "user",
        };
        
        return { user, token: "mock-token-user-456" };
      }
      
      if (email === "librarian@library.com" && password === "librarian123") {
        const user: UserResponse = {
          _id: "librarian-id-789",
          name: "Librarian User",
          email: "librarian@library.com",
          role: "librarian",
        };
        
        return { user, token: "mock-token-librarian-789" };
      }
      
      return { error: "Invalid credentials" };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async register(name: string, email: string, password: string) {
    try {
      // In production, this would be a real API call
      if (email === "admin@library.com" || email === "user@library.com" || email === "librarian@library.com") {
        return { error: "This email is already in use" };
      }
      
      const user: UserResponse = {
        _id: `new-user-${Date.now()}`,
        name,
        email,
        role: "user",
      };
      
      return { user, token: `mock-token-${Date.now()}` };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async logout() {
    // In production, this might invalidate the token on the server
    return { success: true };
  },
};

// Sample book data
const sampleBooks: Book[] = [
  {
    _id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0446310789",
    publishedYear: 1960,
    genre: "Classic",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
    available: true,
  },
  {
    _id: "2",
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    publishedYear: 1949,
    genre: "Dystopian",
    description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg",
    available: false,
    borrowedBy: "user-id-456",
  },
  {
    _id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    publishedYear: 1925,
    genre: "Classic",
    description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg",
    available: true,
  },
  {
    _id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    publishedYear: 1813,
    genre: "Romance",
    description: "Few have failed to be charmed by the witty and independent spirit of Elizabeth Bennet in Austen's beloved classic Pride and Prejudice.",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/17/PrideAndPrejudiceTitlePage.jpg",
    available: true,
  },
  {
    _id: "5",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    publishedYear: 1937,
    genre: "Fantasy",
    description: "A glorious account of a magnificent adventure, filled with suspense and seasoned with a quiet humor that is irresistible.",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg",
    available: true,
  },
];

// Mock book API functions
export const booksApi = {
  async getBooks(filters?: { title?: string; author?: string; genre?: string; available?: boolean }) {
    try {
      // Filter books based on provided filters
      let filteredBooks = [...sampleBooks];
      
      if (filters) {
        if (filters.title) {
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(filters.title!.toLowerCase())
          );
        }
        
        if (filters.author) {
          filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(filters.author!.toLowerCase())
          );
        }
        
        if (filters.genre) {
          filteredBooks = filteredBooks.filter(book => 
            book.genre.toLowerCase() === filters.genre!.toLowerCase()
          );
        }
        
        if (filters.available !== undefined) {
          filteredBooks = filteredBooks.filter(book => book.available === filters.available);
        }
      }
      
      return { books: filteredBooks };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getBookById(id: string) {
    try {
      const book = sampleBooks.find(b => b._id === id);
      if (!book) {
        return { error: "Book not found" };
      }
      return { book };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async addBook(bookData: Omit<Book, '_id' | 'available'>) {
    try {
      // In production, this would be a POST request to add the book
      const newBook: Book = {
        ...bookData,
        _id: `book-${Date.now()}`,
        available: true,
      };
      
      return { book: newBook };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async updateBook(id: string, bookData: Partial<Book>) {
    try {
      // In production, this would be a PUT/PATCH request
      const bookIndex = sampleBooks.findIndex(b => b._id === id);
      if (bookIndex === -1) {
        return { error: "Book not found" };
      }
      
      return { book: { ...sampleBooks[bookIndex], ...bookData } };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async deleteBook(id: string) {
    try {
      // In production, this would be a DELETE request
      const bookIndex = sampleBooks.findIndex(b => b._id === id);
      if (bookIndex === -1) {
        return { error: "Book not found" };
      }
      
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async borrowBook(bookId: string, userId: string) {
    try {
      // In production, this would update both the book and user records
      const bookIndex = sampleBooks.findIndex(b => b._id === bookId);
      if (bookIndex === -1) {
        return { error: "Book not found" };
      }
      
      if (!sampleBooks[bookIndex].available) {
        return { error: "Book is not available" };
      }
      
      const updatedBook = {
        ...sampleBooks[bookIndex],
        available: false,
        borrowedBy: userId,
        borrowDate: new Date(),
        returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      };
      
      return { book: updatedBook };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async returnBook(bookId: string) {
    try {
      // In production, this would update both the book and user records
      const bookIndex = sampleBooks.findIndex(b => b._id === bookId);
      if (bookIndex === -1) {
        return { error: "Book not found" };
      }
      
      if (sampleBooks[bookIndex].available) {
        return { error: "Book is not borrowed" };
      }
      
      const updatedBook = {
        ...sampleBooks[bookIndex],
        available: true,
        borrowedBy: undefined,
        borrowDate: undefined,
        returnDate: undefined,
      };
      
      return { book: updatedBook };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Mock users data for admin/librarian access
const sampleUsers = [
  {
    _id: "user-id-456",
    name: "Regular User",
    email: "user@library.com",
    role: "user",
    borrowedBooks: ["2"],
  },
  {
    _id: "user-id-789",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "user",
    borrowedBooks: [],
  },
  {
    _id: "admin-id-123",
    name: "Admin User",
    email: "admin@library.com",
    role: "admin",
    borrowedBooks: [],
  },
  {
    _id: "librarian-id-789",
    name: "Librarian User",
    email: "librarian@library.com",
    role: "librarian",
    borrowedBooks: [],
  },
];

// Mock user management API for librarians/admins
export const usersApi = {
  async getUsers() {
    try {
      return { users: sampleUsers };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getUserById(id: string) {
    try {
      const user = sampleUsers.find(u => u._id === id);
      if (!user) {
        return { error: "User not found" };
      }
      return { user };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async updateUser(id: string, userData: Partial<User>) {
    try {
      const userIndex = sampleUsers.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return { error: "User not found" };
      }
      
      const updatedUser = { ...sampleUsers[userIndex], ...userData };
      return { user: updatedUser };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async deleteUser(id: string) {
    try {
      const userIndex = sampleUsers.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return { error: "User not found" };
      }
      
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getUserBorrowingHistory(userId: string) {
    try {
      // In production, this would fetch the user's borrowing history
      // For now, we'll just return the user's currently borrowed books
      const user = sampleUsers.find(u => u._id === userId);
      if (!user) {
        return { error: "User not found" };
      }
      
      const borrowedBooks = sampleBooks.filter(book => 
        user.borrowedBooks.includes(book._id!)
      );
      
      return { books: borrowedBooks };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
