
import { connectToDatabase, toObjectId } from '../db';
import { BorrowRecord } from '@/types';

export const borrowController = {
  // Get all borrowing records
  getAllBorrowRecords: async () => {
    try {
      const { borrowRecordsCollection } = await connectToDatabase();
      
      const borrowRecords = await borrowRecordsCollection
        .find({})
        .sort({ borrowDate: -1 })
        .toArray();
      
      return { borrowRecords };
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      return { error: 'Failed to fetch borrowing records' };
    }
  },
  
  // Get borrowing records by status
  getBorrowRecordsByStatus: async (status: 'active' | 'returned' | 'overdue') => {
    try {
      const { borrowRecordsCollection } = await connectToDatabase();
      
      const borrowRecords = await borrowRecordsCollection
        .find({ status })
        .sort({ borrowDate: -1 })
        .toArray();
      
      return { borrowRecords };
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      return { error: 'Failed to fetch borrowing records' };
    }
  },
  
  // Check for overdue books and update status
  checkOverdueBooks: async () => {
    try {
      const { borrowRecordsCollection } = await connectToDatabase();
      
      const currentDate = new Date();
      
      const result = await borrowRecordsCollection.updateMany(
        { 
          status: 'active',
          dueDate: { $lt: currentDate }
        },
        { $set: { status: 'overdue' } }
      );
      
      return { 
        success: true,
        updatedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Error checking overdue books:', error);
      return { error: 'Failed to check overdue books' };
    }
  },
  
  // Get borrowing record by ID
  getBorrowRecordById: async (id: string) => {
    try {
      const { borrowRecordsCollection } = await connectToDatabase();
      
      const borrowRecord = await borrowRecordsCollection.findOne({ _id: toObjectId(id) });
      
      if (!borrowRecord) {
        return { error: 'Borrowing record not found' };
      }
      
      return { borrowRecord };
    } catch (error) {
      console.error('Error fetching borrow record:', error);
      return { error: 'Failed to fetch borrowing record' };
    }
  }
};
