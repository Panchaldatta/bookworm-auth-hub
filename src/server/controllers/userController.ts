
import { connectToDatabase, toObjectId } from '../db';
import { User, UserResponse } from '@/types';

export const userController = {
  // User registration
  register: async (name: string, email: string, password: string) => {
    try {
      const { usersCollection } = await connectToDatabase();
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return { error: 'This email is already in use' };
      }
      
      // In a real app, you would hash the password here
      // const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser: Omit<User, '_id'> = {
        name,
        email,
        password, // In real app, use hashedPassword
        role: 'user',
        borrowedBooks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser as User);
      
      if (!result.acknowledged) {
        return { error: 'Failed to register user' };
      }
      
      // Create user response without password
      const userResponse: UserResponse = {
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      
      // In a real application, you would generate a JWT token here
      // const token = jwt.sign({ userId: userResponse._id }, 'secret_key', { expiresIn: '1h' });
      const token = `mock-token-${Date.now()}`;
      
      return { user: userResponse, token };
    } catch (error) {
      console.error('Error registering user:', error);
      return { error: 'Failed to register user' };
    }
  },
  
  // User login
  login: async (email: string, password: string) => {
    try {
      const { usersCollection } = await connectToDatabase();
      
      const user = await usersCollection.findOne({ email });
      
      if (!user) {
        return { error: 'Invalid credentials' };
      }
      
      // In a real app, you would verify the password with bcrypt
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      const isPasswordValid = password === user.password; // ONLY for demo
      
      if (!isPasswordValid) {
        return { error: 'Invalid credentials' };
      }
      
      // Create user response without password
      const userResponse: UserResponse = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      // In a real application, you would generate a JWT token here
      // const token = jwt.sign({ userId: userResponse._id }, 'secret_key', { expiresIn: '1h' });
      const token = `mock-token-${Date.now()}`;
      
      return { user: userResponse, token };
    } catch (error) {
      console.error('Error logging in:', error);
      return { error: 'Failed to login' };
    }
  },
  
  // Get all users (for admin/librarian)
  getUsers: async () => {
    try {
      const { usersCollection } = await connectToDatabase();
      
      // Exclude password from returned data
      const users = await usersCollection.find({}, {
        projection: { password: 0 }
      }).toArray();
      
      return { users };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { error: 'Failed to fetch users' };
    }
  },
  
  // Get user by ID
  getUserById: async (id: string) => {
    try {
      const { usersCollection } = await connectToDatabase();
      
      const user = await usersCollection.findOne({ _id: toObjectId(id) }, {
        projection: { password: 0 }
      });
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      return { user };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { error: 'Failed to fetch user' };
    }
  },
  
  // Update user
  updateUser: async (id: string, userData: Partial<User>) => {
    try {
      const { usersCollection } = await connectToDatabase();
      
      // Don't allow role change if not valid
      if (userData.role && !['user', 'admin', 'librarian'].includes(userData.role as string)) {
        return { error: 'Invalid role' };
      }
      
      const updateData = {
        ...userData,
        updatedAt: new Date()
      };
      
      // If password is being updated, hash it
      // if (updateData.password) {
      //   updateData.password = await bcrypt.hash(updateData.password, 10);
      // }
      
      const result = await usersCollection.updateOne(
        { _id: toObjectId(id) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return { error: 'User not found' };
      }
      
      const updatedUser = await usersCollection.findOne({ _id: toObjectId(id) }, {
        projection: { password: 0 }
      });
      
      return { user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { error: 'Failed to update user' };
    }
  },
  
  // Delete user
  deleteUser: async (id: string) => {
    try {
      const { usersCollection, booksCollection } = await connectToDatabase();
      
      // Check if user has borrowed books
      const user = await usersCollection.findOne({ _id: toObjectId(id) });
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      if (user.borrowedBooks.length > 0) {
        return { error: 'User has borrowed books. Books must be returned before deleting account.' };
      }
      
      const result = await usersCollection.deleteOne({ _id: toObjectId(id) });
      
      if (result.deletedCount === 0) {
        return { error: 'User not found' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: 'Failed to delete user' };
    }
  },
  
  // Get user borrowing history
  getUserBorrowingHistory: async (userId: string) => {
    try {
      const { borrowRecordsCollection } = await connectToDatabase();
      
      const borrowRecords = await borrowRecordsCollection
        .find({ userId })
        .sort({ borrowDate: -1 })
        .toArray();
      
      return { borrowRecords };
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
      return { error: 'Failed to fetch borrowing history' };
    }
  }
};
