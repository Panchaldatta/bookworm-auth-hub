
import { connectToDatabase, toObjectId } from '../db';
import { Book } from '@/types';

export const bookController = {
  // Get all books with optional filters
  getBooks: async (filters?: { title?: string; author?: string; genre?: string; available?: boolean }) => {
    try {
      const { booksCollection } = await connectToDatabase();
      
      // Build query based on filters
      const query: any = {};
      
      if (filters) {
        if (filters.title) {
          query.title = { $regex: filters.title, $options: 'i' }; // Case insensitive search
        }
        
        if (filters.author) {
          query.author = { $regex: filters.author, $options: 'i' };
        }
        
        if (filters.genre) {
          query.genre = { $regex: filters.genre, $options: 'i' };
        }
        
        if (filters.available !== undefined) {
          query.available = filters.available;
        }
      }
      
      const books = await booksCollection.find(query).toArray();
      return { books };
    } catch (error) {
      console.error('Error fetching books:', error);
      return { error: 'Failed to fetch books' };
    }
  },
  
  // Get a single book by ID
  getBookById: async (id: string) => {
    try {
      const { booksCollection } = await connectToDatabase();
      const book = await booksCollection.findOne({ _id: toObjectId(id) });
      
      if (!book) {
        return { error: 'Book not found' };
      }
      
      return { book };
    } catch (error) {
      console.error('Error fetching book:', error);
      return { error: 'Failed to fetch book' };
    }
  },
  
  // Add a new book
  addBook: async (bookData: Omit<Book, '_id' | 'available'>) => {
    try {
      const { booksCollection } = await connectToDatabase();
      
      const newBook: Omit<Book, '_id'> = {
        ...bookData,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await booksCollection.insertOne(newBook as Book);
      
      if (!result.acknowledged) {
        return { error: 'Failed to add book' };
      }
      
      const insertedBook = await booksCollection.findOne({ _id: result.insertedId });
      return { book: insertedBook };
    } catch (error) {
      console.error('Error adding book:', error);
      return { error: 'Failed to add book' };
    }
  },
  
  // Update a book
  updateBook: async (id: string, bookData: Partial<Book>) => {
    try {
      const { booksCollection } = await connectToDatabase();
      
      const updateData = {
        ...bookData,
        updatedAt: new Date()
      };
      
      const result = await booksCollection.updateOne(
        { _id: toObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return { error: 'Book not found' };
      }
      
      const updatedBook = await booksCollection.findOne({ _id: toObjectId(id) });
      return { book: updatedBook };
    } catch (error) {
      console.error('Error updating book:', error);
      return { error: 'Failed to update book' };
    }
  },
  
  // Delete a book
  deleteBook: async (id: string) => {
    try {
      const { booksCollection } = await connectToDatabase();
      
      const result = await booksCollection.deleteOne({ _id: toObjectId(id) });
      
      if (result.deletedCount === 0) {
        return { error: 'Book not found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      return { error: 'Failed to delete book' };
    }
  },
  
  // Borrow a book
  borrowBook: async (bookId: string, userId: string) => {
    try {
      const { booksCollection, usersCollection, borrowRecordsCollection } = await connectToDatabase();
      
      // Check if book exists and is available
      const book = await booksCollection.findOne({ _id: toObjectId(bookId) });
      
      if (!book) {
        return { error: 'Book not found' };
      }
      
      if (!book.available) {
        return { error: 'Book is not available' };
      }
      
      // Check if user exists
      const user = await usersCollection.findOne({ _id: toObjectId(userId) });
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days borrowing period
      
      // Update book status
      await booksCollection.updateOne(
        { _id: toObjectId(bookId) },
        {
          $set: {
            available: false,
            borrowedBy: userId,
            borrowDate,
            returnDate: dueDate
          }
        }
      );
      
      // Add book to user's borrowed books
      await usersCollection.updateOne(
        { _id: toObjectId(userId) },
        { $push: { borrowedBooks: bookId } }
      );
      
      // Create borrow record
      const borrowRecord = {
        bookId,
        userId,
        bookTitle: book.title,
        userName: user.name,
        borrowDate,
        dueDate,
        status: 'active' as 'active' | 'returned' | 'overdue'
      };
      
      await borrowRecordsCollection.insertOne(borrowRecord as BorrowRecord);
      
      const updatedBook = await booksCollection.findOne({ _id: toObjectId(bookId) });
      return { book: updatedBook };
    } catch (error) {
      console.error('Error borrowing book:', error);
      return { error: 'Failed to borrow book' };
    }
  },
  
  // Return a book
  returnBook: async (bookId: string, userId: string) => {
    try {
      const { booksCollection, usersCollection, borrowRecordsCollection } = await connectToDatabase();
      
      // Check if book exists and is borrowed
      const book = await booksCollection.findOne({ _id: toObjectId(bookId) });
      
      if (!book) {
        return { error: 'Book not found' };
      }
      
      if (book.available) {
        return { error: 'Book is not borrowed' };
      }
      
      if (book.borrowedBy !== userId) {
        return { error: 'Book is not borrowed by this user' };
      }
      
      // Update book status
      await booksCollection.updateOne(
        { _id: toObjectId(bookId) },
        {
          $set: {
            available: true,
            borrowedBy: undefined,
            borrowDate: undefined,
            returnDate: undefined
          }
        }
      );
      
      // Remove book from user's borrowed books
      await usersCollection.updateOne(
        { _id: toObjectId(userId) },
        { $pull: { borrowedBooks: bookId } }
      );
      
      // Update borrow record
      await borrowRecordsCollection.updateOne(
        { bookId, userId, status: 'active' },
        {
          $set: {
            returnDate: new Date(),
            status: 'returned'
          }
        }
      );
      
      const updatedBook = await booksCollection.findOne({ _id: toObjectId(bookId) });
      return { book: updatedBook };
    } catch (error) {
      console.error('Error returning book:', error);
      return { error: 'Failed to return book' };
    }
  }
};
