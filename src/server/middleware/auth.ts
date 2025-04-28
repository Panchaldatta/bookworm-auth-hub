
// Basic auth middleware implementation for the MongoDB backend
// In a real application, this would verify JWT tokens and handle permissions

export interface AuthRequest {
  userId?: string;
  userRole?: 'user' | 'librarian' | 'admin';
}

export const authMiddleware = {
  // Check if user is authenticated
  isAuthenticated: (token: string): AuthRequest | null => {
    // In a real app, you would verify a JWT token
    // const decoded = jwt.verify(token, 'secret_key');
    
    // For this mock version, we'll parse mock tokens
    if (!token || !token.startsWith('mock-token-')) {
      return null;
    }
    
    // Parse user ID and role from mock token
    // In a real app, this would come from the decoded JWT
    let userId = 'unknown';
    let userRole: 'user' | 'librarian' | 'admin' = 'user';
    
    if (token.includes('admin')) {
      userId = 'admin-id-123';
      userRole = 'admin';
    } else if (token.includes('librarian')) {
      userId = 'librarian-id-789';
      userRole = 'librarian';
    } else if (token.includes('user')) {
      userId = 'user-id-456';
      userRole = 'user';
    }
    
    return { userId, userRole };
  },
  
  // Check if user is an admin
  isAdmin: (token: string): boolean => {
    const authRequest = authMiddleware.isAuthenticated(token);
    return authRequest?.userRole === 'admin';
  },
  
  // Check if user is a librarian or admin
  isLibrarian: (token: string): boolean => {
    const authRequest = authMiddleware.isAuthenticated(token);
    return authRequest?.userRole === 'librarian' || authRequest?.userRole === 'admin';
  }
};
