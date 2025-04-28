
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import BookDetail from "./pages/BookDetail";
import AdminBooks from "./pages/admin/Books";
import AdminUsers from "./pages/admin/Users";
import EditUser from "./pages/admin/EditUser";
import AddBook from "./pages/admin/AddBook";
import EditBook from "./pages/admin/EditBook"; 
import UserProfile from "./pages/UserProfile";
import MyBooks from "./pages/MyBooks";
import BorrowingHistory from "./pages/BorrowingHistory";

const queryClient = new QueryClient();

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactNode;
  adminOnly?: boolean;
  librarianOnly?: boolean;
}

const ProtectedRoute = ({ element, adminOnly = false, librarianOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLibrarian } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (librarianOnly && !isLibrarian) {
    return <Navigate to="/" />;
  }
  
  return <>{element}</>;
};

// Auth Routes (redirect if already logged in)
interface AuthRouteProps {
  element: React.ReactNode;
}

const AuthRoute = ({ element }: AuthRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{element}</>;
};

// App Routes Component (uses auth context)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/books" element={<Layout><Books /></Layout>} />
      <Route path="/books/:id" element={<Layout><BookDetail /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/login" element={<AuthRoute element={<Login />} />} />
      <Route path="/register" element={<AuthRoute element={<Register />} />} />
      
      {/* User protected routes */}
      <Route path="/profile" element={<ProtectedRoute element={<Layout><UserProfile /></Layout>} />} />
      <Route path="/my-books" element={<ProtectedRoute element={<Layout><MyBooks /></Layout>} />} />
      
      {/* Librarian protected routes */}
      <Route path="/admin/books" element={<ProtectedRoute librarianOnly element={<Layout><AdminBooks /></Layout>} />} />
      <Route path="/admin/books/add" element={<ProtectedRoute librarianOnly element={<Layout><AddBook /></Layout>} />} />
      <Route path="/admin/books/edit/:id" element={<ProtectedRoute librarianOnly element={<Layout><EditBook /></Layout>} />} />
      <Route path="/admin/users" element={<ProtectedRoute librarianOnly element={<Layout><AdminUsers /></Layout>} />} />
      <Route path="/admin/users/edit/:id" element={<ProtectedRoute librarianOnly element={<Layout><EditUser /></Layout>} />} />
      <Route path="/user/:id/history" element={<ProtectedRoute librarianOnly element={<Layout><BorrowingHistory /></Layout>} />} />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
