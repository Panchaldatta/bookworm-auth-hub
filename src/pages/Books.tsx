
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Book, BookFilters } from '@/types';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const genres = [
  "All Genres", "Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller", 
  "Romance", "Horror", "Biography", "History", "Classic", "Dystopian"
];

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BookFilters>({
    title: '',
    author: '',
    genre: '',
    available: undefined
  });
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const result = await booksApi.getBooks();
        if ('books' in result) {
          setBooks(result.books);
          setFilteredBooks(result.books);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "Error",
          description: "Failed to load books. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [toast]);

  useEffect(() => {
    // Apply filters to books
    let results = [...books];
    
    if (filters.title) {
      results = results.filter(book => 
        book.title.toLowerCase().includes(filters.title!.toLowerCase())
      );
    }
    
    if (filters.author) {
      results = results.filter(book => 
        book.author.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }
    
    if (filters.genre && filters.genre !== "All Genres") {
      results = results.filter(book => 
        book.genre.toLowerCase() === filters.genre!.toLowerCase()
      );
    }
    
    if (filters.available !== undefined) {
      results = results.filter(book => book.available === filters.available);
    }
    
    setFilteredBooks(results);
  }, [books, filters]);

  const resetFilters = () => {
    setFilters({
      title: '',
      author: '',
      genre: '',
      available: undefined
    });
  };

  return (
    <div className="container mx-auto max-w-5xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-library-primary mb-2">Book Catalog</h1>
        <p className="text-muted-foreground">Browse our collection of books</p>
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-8 border border-library-primary/10">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Find Books</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="text-library-primary"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title..."
              className="pl-10"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
          </div>
          
          {showFilters && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Author</label>
                  <Input
                    placeholder="Search by author..."
                    value={filters.author}
                    onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Genre</label>
                  <Select
                    value={filters.genre || "All Genres"}
                    onValueChange={(value) => setFilters({ ...filters, genre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={filters.available === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, available: filters.available === true ? undefined : true })}
                    className={filters.available === true ? "bg-library-primary" : ""}
                  >
                    Available
                  </Button>
                  <Button
                    type="button"
                    variant={filters.available === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, available: filters.available === false ? undefined : false })}
                    className={filters.available === false ? "bg-library-primary" : ""}
                  >
                    Borrowed
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="text-library-primary"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
          </p>
        </CardFooter>
      </Card>
      
      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border border-library-primary/10">
              <div className="aspect-[2/3] bg-gray-200 animate-pulse rounded-t-md"></div>
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-1">No Books Found</h3>
          <p className="text-muted-foreground mb-4">
            No books match your current filters. Try adjusting your search criteria.
          </p>
          <Button onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Card 
              key={book._id} 
              className="border border-library-primary/10 hover:border-library-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer group"
              onClick={() => navigate(`/books/${book._id}`)}
            >
              <div 
                className="aspect-[2/3] bg-library-secondary rounded-t-md relative overflow-hidden"
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    View Details
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{book.title}</CardTitle>
                <CardDescription className="truncate">{book.author}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {book.genre}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {book.publishedYear}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Call to action for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 bg-library-primary/10 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">Want to borrow books?</h3>
          <p className="mb-4 text-muted-foreground">
            Create an account to borrow books from our library.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
