
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book as BookIcon, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi } from '@/lib/api';
import { Book } from '@/types';

const MyBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user?._id) return;
      
      try {
        // In production, this would be a dedicated API call to get user's books
        // For now, we'll filter from all books
        const result = await booksApi.getBooks();
        
        if ('books' in result) {
          setBooks(result.books.filter(book => book.borrowedBy === user._id));
        } else {
          toast.error('Failed to load your books');
        }
      } catch (error) {
        console.error('Error fetching user books:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBooks();
  }, [user?._id]);

  const handleReturn = async (bookId: string) => {
    try {
      const result = await booksApi.returnBook(bookId);
      
      if ('book' in result) {
        // Update local state
        setBooks(prevBooks => 
          prevBooks.map(book => 
            book._id === bookId ? result.book : book
          ).filter(book => !book.available)
        );
        
        toast.success('Book returned successfully');
      } else {
        toast.error(result.error || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Get current date for calculations
  const currentDate = new Date();

  // Active (currently borrowed) books
  const currentlyBorrowed = books.filter(book => !book.available && book.borrowedBy === user?._id);
  
  // Books from borrowing history
  const borrowingHistory = books.filter(book => book.available && book.borrowedBy === undefined);
  
  // Books that are overdue (return date is past current date)
  const overdueBooks = currentlyBorrowed.filter(book => 
    book.returnDate && new Date(book.returnDate) < currentDate
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-library-primary">My Books</h1>
          <p className="text-muted-foreground">Manage your borrowed books and history</p>
        </div>

        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="current">
              Currently Borrowed
              {currentlyBorrowed.length > 0 && (
                <span className="ml-2 bg-library-primary text-white rounded-full px-2 py-1 text-xs">
                  {currentlyBorrowed.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue
              {overdueBooks.length > 0 && (
                <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs">
                  {overdueBooks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {currentlyBorrowed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentlyBorrowed.map((book) => (
                  <Card key={book._id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-library-primary">{book.title}</CardTitle>
                      <CardDescription>{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm mb-4">
                        <div className="flex items-center text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Borrowed on: {book.borrowDate ? new Date(book.borrowDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className={
                            book.returnDate && new Date(book.returnDate) < currentDate
                              ? 'text-red-600 font-medium'
                              : ''
                          }>
                            Due by: {book.returnDate ? new Date(book.returnDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-3">{book.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleReturn(book._id!)}
                      >
                        Return Book
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto bg-library-secondary/30 p-6 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <BookIcon className="h-8 w-8 text-library-primary/50" />
                </div>
                <h3 className="text-lg font-medium mb-1">No books currently borrowed</h3>
                <p className="text-muted-foreground mb-6">You don't have any books checked out at the moment.</p>
                <Button onClick={() => navigate('/books')}>Browse Books</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overdue">
            {overdueBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueBooks.map((book) => (
                  <Card key={book._id} className="flex flex-col border-red-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-library-primary">{book.title}</CardTitle>
                          <CardDescription>{book.author}</CardDescription>
                        </div>
                        <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Overdue
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm mb-4">
                        <div className="flex items-center text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Borrowed on: {book.borrowDate ? new Date(book.borrowDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-red-600 font-medium">
                            Was due: {book.returnDate ? new Date(book.returnDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleReturn(book._id!)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Return Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto bg-green-100 p-6 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <BookIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">No overdue books</h3>
                <p className="text-muted-foreground">You don't have any overdue books. Great job!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {borrowingHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {borrowingHistory.map((book) => (
                  <Card key={book._id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-library-primary">{book.title}</CardTitle>
                      <CardDescription>{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm line-clamp-3">{book.description}</p>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto bg-library-secondary/30 p-6 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-library-primary/50" />
                </div>
                <h3 className="text-lg font-medium mb-1">No borrowing history</h3>
                <p className="text-muted-foreground mb-6">You haven't borrowed any books yet.</p>
                <Button onClick={() => navigate('/books')}>Browse Books</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBooks;
