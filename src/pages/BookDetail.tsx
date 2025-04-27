
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Book as BookIcon, 
  Calendar, 
  User, 
  Edit, 
  Trash,
  ArrowLeft
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi } from '@/lib/api';
import { Book } from '@/types';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const { user, isAuthenticated, isLibrarian } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        const result = await booksApi.getBookById(id);
        if ('book' in result) {
          setBook(result.book);
        } else {
          toast.error('Error loading book details');
          navigate('/books');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [id, navigate]);

  const handleBorrow = async () => {
    if (!book || !user?._id) return;
    
    setIsBorrowing(true);
    try {
      const result = await booksApi.borrowBook(book._id!, user._id);
      
      if ('book' in result) {
        setBook(result.book);
        toast.success('Book borrowed successfully');
      } else {
        toast.error(result.error || 'Failed to borrow book');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleReturn = async () => {
    if (!book || !book._id) return;
    
    setIsReturning(true);
    try {
      const result = await booksApi.returnBook(book._id);
      
      if ('book' in result) {
        setBook(result.book);
        toast.success('Book returned successfully');
      } else {
        toast.error(result.error || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsReturning(false);
    }
  };

  const deleteBook = async () => {
    if (!book || !book._id) return;
    
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const result = await booksApi.deleteBook(book._id);
        
        if ('success' in result && result.success) {
          toast.success('Book deleted successfully');
          navigate('/books');
        } else {
          toast.error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/books')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
        </Button>
      </div>
    );
  }

  const userHasBorrowed = book.borrowedBy === user?._id;
  
  return (
    <div className="container mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/books')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-library-secondary/50 p-6 rounded-full mb-4">
                <BookIcon className="h-12 w-12 text-library-primary" />
              </div>
              <CardTitle className="text-xl">Book Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`} 
                    className="rounded-md max-h-64 object-cover"
                  />
                ) : (
                  <div className="bg-library-secondary/50 rounded-md flex items-center justify-center w-full h-64">
                    <BookIcon className="h-12 w-12 text-library-primary/50" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Badge 
                  className={book.available ? 'bg-green-600' : 'bg-red-600'}
                >
                  {book.available ? 'Available' : 'Borrowed'}
                </Badge>
              </div>
            </CardContent>
            {isLibrarian && (
              <CardFooter className="flex justify-between border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/admin/books/edit/${book._id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={deleteBook}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl text-library-primary">{book.title}</CardTitle>
              <CardDescription className="text-lg">{book.author}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published Year</p>
                  <p className="font-medium">{book.publishedYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-medium">{book.genre}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{book.description}</p>
              </div>
              
              {!book.available && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Borrowing Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Borrow Date</p>
                        <p className="font-medium">
                          {book.borrowDate ? new Date(book.borrowDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Date</p>
                        <p className="font-medium">
                          {book.returnDate ? new Date(book.returnDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="border-t pt-4">
              {isAuthenticated && (
                <>
                  {book.available ? (
                    <Button 
                      className="w-full bg-library-primary hover:bg-library-primary/90"
                      onClick={handleBorrow}
                      disabled={isBorrowing}
                    >
                      {isBorrowing ? 'Processing...' : 'Borrow Book'}
                    </Button>
                  ) : userHasBorrowed || isLibrarian ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={handleReturn}
                      disabled={isReturning}
                    >
                      {isReturning ? 'Processing...' : 'Return Book'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Currently Unavailable
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
