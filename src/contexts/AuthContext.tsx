
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, UserResponse } from '@/types';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLibrarian: false,
};

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check for saved auth info in localStorage on initial load
    try {
      const savedUser = localStorage.getItem('libraryUser');
      const savedToken = localStorage.getItem('libraryToken');
      
      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser) as UserResponse;
        return {
          user,
          token: savedToken,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLibrarian: user.role === 'librarian' || user.role === 'admin',
        };
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
      // Clear potentially corrupt data
      localStorage.removeItem('libraryUser');
      localStorage.removeItem('libraryToken');
    }
    
    return initialAuthState;
  });

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (authState.user && authState.token) {
      localStorage.setItem('libraryUser', JSON.stringify(authState.user));
      localStorage.setItem('libraryToken', authState.token);
    } else {
      localStorage.removeItem('libraryUser');
      localStorage.removeItem('libraryToken');
    }
  }, [authState]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      
      if ('error' in result) {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
      
      const { user, token } = result;
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
        isLibrarian: user.role === 'librarian' || user.role === 'admin',
      });
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const result = await authApi.register(name, email, password);
      
      if ('error' in result) {
        toast({
          title: 'Registration Failed',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
      
      const { user, token } = result;
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
        isLibrarian: user.role === 'librarian' || user.role === 'admin',
      });
      
      toast({
        title: 'Registration Successful',
        description: `Welcome to the library, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setAuthState(initialAuthState);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the auth state even if there's an error
      setAuthState(initialAuthState);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
