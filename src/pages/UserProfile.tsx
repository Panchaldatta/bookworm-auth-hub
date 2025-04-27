
import { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Edit
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
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Member since {new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit className="mr-2 h-4 w-4" />
                {isEditMode ? 'Cancel Editing' : 'Edit Profile'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          {isEditMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="name"
                      className="w-full p-2 border rounded-md"
                      defaultValue={user.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-2 border rounded-md"
                      defaultValue={user.email}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="w-full p-2 border rounded-md"
                      placeholder="Confirm new password"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="mr-2 bg-library-primary hover:bg-library-primary/90">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Borrowing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-library-secondary/20 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-library-primary">0</p>
                      <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                    </div>
                    <div className="bg-library-secondary/20 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-library-primary">0</p>
                      <p className="text-sm text-muted-foreground">Borrowing History</p>
                    </div>
                    <div className="bg-library-secondary/20 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-muted-foreground">On Time Returns</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">View Full History</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for due dates and new arrivals
                      </p>
                    </div>
                    <div>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Reading Preferences</p>
                      <p className="text-sm text-muted-foreground">
                        Set your favorite genres to receive recommendations
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
