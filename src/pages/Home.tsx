
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, BookOpen, Search, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { booksApi } from '@/lib/api';
import { Book as BookType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const [recentBooks, setRecentBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const result = await booksApi.getBooks();
        if ('books' in result) {
          setRecentBooks(result.books.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching recent books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Browse Books",
      description: "Explore our vast collection of books across various genres",
      path: "/books",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Search,
      title: "Search",
      description: "Find exactly what you're looking for with our advanced search",
      path: "/search",
      color: "bg-emerald-100 text-emerald-700"
    },
    {
      icon: User,
      title: isAuthenticated ? "Your Profile" : "Join Now",
      description: isAuthenticated 
        ? "Manage your library account and borrowed books" 
        : "Create an account to start borrowing books",
      path: isAuthenticated ? "/profile" : "/register",
      color: "bg-amber-100 text-amber-700"
    },
    {
      icon: Book,
      title: "Borrowed Books",
      description: "Keep track of your current loans and history",
      path: "/my-books",
      color: "bg-red-100 text-red-700",
      authRequired: true
    }
  ];

  return (
    <div className="container mx-auto max-w-5xl animate-fade-in">
      {/* Hero Section */}
      <section className="mb-10">
        <div className="bg-library-primary/10 rounded-lg p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-library-primary mb-4">Welcome to Book Haven</h1>
            <p className="text-lg max-w-2xl mx-auto mb-6">
              Your community library where books and knowledge are freely accessible to everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-library-primary hover:bg-library-primary/90"
                onClick={() => navigate('/books')}
              >
                Browse Collection
              </Button>
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  className="border-library-primary text-library-primary hover:bg-library-primary/10"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-library-primary mb-6">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            (!feature.authRequired || isAuthenticated) && (
              <Card 
                key={index} 
                className="border border-library-primary/10 hover:border-library-primary/30 transition-all duration-300 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-full ${feature.color} flex items-center justify-center mb-2`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(feature.path)}
                    className="text-library-primary hover:text-library-primary hover:bg-library-primary/10"
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            )
          ))}
        </div>
      </section>
      
      {/* Recent Books Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-library-primary">Recently Added Books</h2>
          <Button 
            variant="link" 
            onClick={() => navigate('/books')}
            className="text-library-primary"
          >
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-library-primary/10">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse rounded-t-md"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentBooks.map((book) => (
              <Card 
                key={book._id} 
                className="border border-library-primary/10 hover:border-library-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/books/${book._id}`)}
              >
                <div 
                  className="aspect-[2/3] bg-library-secondary rounded-t-md"
                  style={{
                    backgroundImage: book.coverImage ? `url(${book.coverImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!book.coverImage && (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-library-primary/50" />
                    </div>
                  )}
                  {!book.available && (
                    <div className="bg-red-500 text-white px-2 py-1 absolute top-2 right-2 rounded text-xs font-medium">
                      Borrowed
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
      
      {/* Join the Library Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <section className="mb-10">
          <Card className="border-none bg-library-accent/10">
            <CardHeader>
              <CardTitle className="text-xl text-library-primary">Join Our Library Today</CardTitle>
              <CardDescription>
                Create an account to borrow books, save favorites, and more.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="bg-library-accent text-white hover:bg-library-accent/90"
                onClick={() => navigate('/register')}
              >
                Sign Up Now
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Home;
