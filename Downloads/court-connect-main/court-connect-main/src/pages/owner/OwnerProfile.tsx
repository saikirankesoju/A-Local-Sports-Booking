import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { toast } from 'sonner';

const OwnerProfile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-2xl">
          <h1 className="text-2xl font-display font-bold mb-8">Owner Profile</h1>
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
                {user?.fullName.split(' ').map(n => n[0]).join('') || 'O'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user?.fullName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" /></div>
            <Button onClick={() => toast.success('Profile updated!')}>Save Changes</Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerProfile;
