
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Book, 
  User, 
  Calendar 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { booksApi } from '@/lib/api';
import { Book as BookType } from '@/types';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [searchResults, setSearchResults] = useState<BookType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      // Build search filters based on search type
      const filters: Record<string, any> = {};
      filters[searchType] = searchQuery;
      
      const result = await booksApi.getBooks(filters);
      
      if ('books' in result) {
        setSearchResults(result.books);
      } else {
        console.error("Error searching books:", result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-library-primary">Search Library</h1>
            <p className="text-muted-foreground">Find books by title, author, or genre</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Search</CardTitle>
            <CardDescription>Search our entire book catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <Tabs defaultValue="title" onValueChange={(value) => setSearchType(value)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="title">Title</TabsTrigger>
                  <TabsTrigger value="author">Author</TabsTrigger>
                  <TabsTrigger value="genre">Genre</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder={`Search by ${searchType}...`}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-library-primary hover:bg-library-primary/90"
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((book) => (
              <Card key={book._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-library-primary">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Genre:</span> {book.genre}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Published:</span> {book.publishedYear}
                  </p>
                  <p className="text-sm line-clamp-3">{book.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <div className={`text-sm ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                    {book.available ? 'Available' : 'Borrowed'}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/books/${book._id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No books found matching your search.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
