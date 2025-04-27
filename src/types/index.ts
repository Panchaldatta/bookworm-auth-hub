
// User related types
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  borrowedBooks: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
