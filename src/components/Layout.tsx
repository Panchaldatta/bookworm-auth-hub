
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LogOut, Home, Search, User, Users, BookPlus, Book } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const LibrarySidebar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const menuItems = [
    {
      title: 'Home',
      path: '/',
      icon: Home,
      requiredAuth: false,
    },
    {
      title: 'Book Catalog',
      path: '/books',
      icon: BookOpen,
      requiredAuth: false,
    },
    {
      title: 'Search',
      path: '/search',
      icon: Search,
      requiredAuth: false,
    },
    {
      title: 'My Books',
      path: '/my-books',
      icon: Book,
      requiredAuth: true,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      requiredAuth: true,
    },
    // Admin only routes
    {
      title: 'Manage Books',
      path: '/admin/books',
      icon: BookPlus,
      requiredAuth: true,
      adminOnly: true,
    },
    {
      title: 'Manage Users',
      path: '/admin/users',
      icon: Users,
      requiredAuth: true,
      adminOnly: true,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-5 border-b">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-library-accent" />
          <h1 className="text-xl font-semibold text-library-primary">Book Haven</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Skip if the item requires authentication and user is not authenticated
                if (item.requiredAuth && !isAuthenticated) return null;
                // Skip if the item is admin only and user is not admin
                if (item.adminOnly && !isAdmin) return null;
                
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={`${isActive ? 'bg-library-primary/10 text-library-primary font-medium' : ''}`}
                      asChild
                    >
                      <button onClick={() => navigate(item.path)}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-full bg-library-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-library-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LibrarySidebar />
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-library-background border-b p-4 flex items-center justify-between">
            <SidebarTrigger />
            <h2 className="text-xl font-semibold text-library-primary">Library Management System</h2>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
