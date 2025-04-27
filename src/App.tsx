
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ element, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
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
      <Route path="/login" element={<AuthRoute element={<Login />} />} />
      <Route path="/register" element={<AuthRoute element={<Register />} />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
