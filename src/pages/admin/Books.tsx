
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book as BookIcon, 
  Plus, 
  Edit, 
  Trash, 
  Search
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { booksApi } from '@/lib/api';
import { Book } from '@/types';

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const result = await booksApi.getBooks();
        if ('books' in result) {
          setBooks(result.books);
          setFilteredBooks(result.books);
        } else {
          toast.error('Failed to load books');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const handleDeleteBook = async (id: string) => {
    try {
      const result = await booksApi.deleteBook(id);
      
      if ('success' in result && result.success) {
        // Update local state
        setBooks(prevBooks => prevBooks.filter(book => book._id !== id));
        setFilteredBooks(prevBooks => prevBooks.filter(book => book._id !== id));
        
        toast.success('Book deleted successfully');
      } else {
        toast.error('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-library-primary">Book Management</h1>
            <p className="text-muted-foreground">Add, edit or remove books from the library</p>
          </div>
          <Button 
            className="bg-library-primary hover:bg-library-primary/90"
            onClick={() => navigate('/admin/books/add')}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Book
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Library Books</CardTitle>
            <CardDescription>
              Showing {filteredBooks.length} of {books.length} books
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading books...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.genre}</TableCell>
                        <TableCell>
                          <Badge
                            className={book.available ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {book.available ? 'Available' : 'Borrowed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/books/${book._id}`)}
                            >
                              <BookIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => navigate(`/admin/books/edit/${book._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Book</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{book.title}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDeleteBook(book._id!)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No books found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBooks;
