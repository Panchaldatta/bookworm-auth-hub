// User related types
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "librarian";
  borrowedBooks: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "librarian";
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLibrarian: boolean;
}

// For API responses that include user data without passwords
export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "librarian";
  borrowedBooks: string[];
}

// Book related types
export interface Book {
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
  coverImage?: string;
  available: boolean;
  borrowedBy?: string;
  borrowDate?: Date;
  returnDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookFilters {
  title?: string;
  author?: string;
  genre?: string;
  available?: boolean;
}

// Borrowing related types
export interface BorrowRecord {
  _id?: string;
  bookId: string;
  userId: string;
  bookTitle: string;
  userName: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: "active" | "returned" | "overdue";
}

// Member related types
export interface Member {
  _id: string;
  name: string;
  email: string;
  role: "user";
  borrowedBooks: string[];
  borrowHistory: BorrowRecord[];
}
