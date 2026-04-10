import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatTime } from '@/lib/utils';

const ProfilePage = () => {
  const { user } = useAuth();
  const { bookings } = useData();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => toast.success('Profile updated!');

  if (!user) return null;

  const userBookings = bookings.filter(b => b.userId === user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-8">Profile</h1>

        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">{user.role}</Badge>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {user.role === 'user' && <TabsTrigger value="bookings">My Bookings</TabsTrigger>}
          </TabsList>
          <TabsContent value="details">
            <div className="rounded-xl border bg-card p-6 space-y-4 mt-4">
              <div>
                <Label htmlFor="pname">Full Name</Label>
                <Input id="pname" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="pemail">Email</Label>
                <Input id="pemail" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </TabsContent>
          {user.role === 'user' && (
            <TabsContent value="bookings">
              <div className="space-y-3 mt-4">
                {userBookings.map(b => (
                  <div key={b.id} className="rounded-lg border bg-card p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{b.venueName}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(b.startTime)} IST</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{b.status}</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
