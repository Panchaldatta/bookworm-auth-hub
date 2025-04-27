
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Book, 
  ArrowLeft,
  Clock 
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
import { usersApi, booksApi } from '@/lib/api';
import { BorrowRecord } from '@/types';

const BorrowingHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      if (!id) return;
      
      try {
        // Fetch user details
        const userResult = await usersApi.getUserById(id);
        
        if ('user' in userResult) {
          setUser(userResult.user);
          
          // Fetch borrowing history
          const historyResult = await usersApi.getUserBorrowingHistory(id);
          
          if ('books' in historyResult) {
            // Transform books to borrowing records
            const records: BorrowRecord[] = historyResult.books.map(book => ({
              _id: `${book._id}-${Date.now()}`,
              bookId: book._id!,
              userId: id,
              bookTitle: book.title,
              userName: userResult.user.name,
              borrowDate: book.borrowDate || new Date(),
              dueDate: book.returnDate || new Date(),
              status: book.available ? 'returned' : 'active',
            }));
            
            setBorrowHistory(records);
          } else {
            toast.error('Failed to load borrowing history');
          }
        } else {
          toast.error('User not found');
          navigate('/admin/users');
        }
      } catch (error) {
        console.error('Error fetching user or history:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndHistory();
  }, [id, navigate]);

  const handleReturnBook = async (bookId: string) => {
    try {
      const result = await booksApi.returnBook(bookId);
      
      if ('book' in result) {
        // Update local state
        setBorrowHistory(prev => prev.map(record => {
          if (record.bookId === bookId) {
            return {
              ...record,
              status: 'returned',
            };
          }
          return record;
        }));
        
        toast.success('Book returned successfully');
      } else {
        toast.error(result.error || 'Failed to return book');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading borrowing history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/admin/users')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-library-secondary/50 p-6 rounded-full mb-4">
                <User className="h-12 w-12 text-library-primary" />
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>
                <Badge
                  className={user.role === 'admin' ? 'bg-red-600' : 
                            user.role === 'librarian' ? 'bg-blue-600' : 
                            'bg-green-600'}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user.borrowedBooks?.length || 0} books currently borrowed</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Borrowing History
              </CardTitle>
              <CardDescription>
                Complete borrowing history for {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {borrowHistory.length > 0 ? (
                <div className="space-y-4">
                  {borrowHistory.map((record) => (
                    <Card key={record._id} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{record.bookTitle}</CardTitle>
                          <Badge 
                            className={
                              record.status === 'active' ? 'bg-blue-600' : 
                              record.status === 'returned' ? 'bg-green-600' : 
                              'bg-red-600'
                            }
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Borrow Date:</span>
                            <p>{new Date(record.borrowDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due Date:</span>
                            <p>{new Date(record.dueDate).toLocaleDateString()}</p>
                          </div>
                          {record.status === 'returned' && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Return Date:</span>
                                <p>{new Date().toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <p>Returned on time</p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                      {record.status === 'active' && (
                        <CardFooter className="border-t pt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReturnBook(record.bookId)}
                          >
                            Mark as Returned
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No borrowing history found for this user.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BorrowingHistory;
