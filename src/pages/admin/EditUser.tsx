
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api';
import { UserListItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as "user" | "admin" | "librarian",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const result = await usersApi.getUserById(id);
        if ('user' in result) {
          // Ensure the role is properly typed when setting the user state
          const userData = result.user;
          
          // Create a properly typed user object
          const typedUser: UserListItem = {
            ...userData,
            role: userData.role as "user" | "admin" | "librarian",
            borrowedBooks: userData.borrowedBooks || []
          };
          
          setUser(typedUser);
          setFormData({
            name: userData.name,
            email: userData.email,
            role: userData.role as "user" | "admin" | "librarian",
          });
        } else {
          toast.error('Failed to load user details');
          navigate('/admin/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('An unexpected error occurred');
        navigate('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as "user" | "admin" | "librarian" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      const result = await usersApi.updateUser(id, {
        name: formData.name,
        email: formData.email,
        role: formData.role as "user" | "admin" | "librarian",
      });
      
      if ('user' in result) {
        toast.success('User updated successfully');
        navigate('/admin/users');
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-library-primary">Edit User</h1>
            <p className="text-muted-foreground">Update user details</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>
                Make changes to user information below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="librarian">Librarian</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditUser;
