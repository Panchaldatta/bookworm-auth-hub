
import { bookController, userController, borrowController, authMiddleware } from '@/server';
import { toast } from '@/components/ui/use-toast';

// Helper to handle API errors
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

// API for authentication operations
export const authApi = {
  async login(email: string, password: string) {
    try {
      return await userController.login(email, password);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async register(name: string, email: string, password: string) {
    try {
      return await userController.register(name, email, password);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async logout() {
    // In production, this might invalidate the token on the server
    return { success: true };
  },
};

// API for book operations
export const booksApi = {
  async getBooks(filters?: { title?: string; author?: string; genre?: string; available?: boolean }) {
    try {
      return await bookController.getBooks(filters);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getBookById(id: string) {
    try {
      return await bookController.getBookById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async addBook(bookData: any) {
    try {
      return await bookController.addBook(bookData);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async updateBook(id: string, bookData: any) {
    try {
      return await bookController.updateBook(id, bookData);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async deleteBook(id: string) {
    try {
      return await bookController.deleteBook(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async borrowBook(bookId: string, userId: string) {
    try {
      return await bookController.borrowBook(bookId, userId);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async returnBook(bookId: string, userId: string) {
    try {
      return await bookController.returnBook(bookId, userId);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API for user management
export const usersApi = {
  async getUsers() {
    try {
      return await userController.getUsers();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getUserById(id: string) {
    try {
      return await userController.getUserById(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async updateUser(id: string, userData: any) {
    try {
      return await userController.updateUser(id, userData);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async deleteUser(id: string) {
    try {
      return await userController.deleteUser(id);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getUserBorrowingHistory(userId: string) {
    try {
      return await userController.getUserBorrowingHistory(userId);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API for borrowing operations
export const borrowingApi = {
  async getAllBorrowRecords() {
    try {
      return await borrowController.getAllBorrowRecords();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getBorrowRecordsByStatus(status: 'active' | 'returned' | 'overdue') {
    try {
      return await borrowController.getBorrowRecordsByStatus(status);
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async checkOverdueBooks() {
    try {
      return await borrowController.checkOverdueBooks();
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  async getBorrowRecordById(id: string) {
    try {
      return await borrowController.getBorrowRecordById(id);
    } catch (error) {
      return handleApiError(error);
    }
  }
};
