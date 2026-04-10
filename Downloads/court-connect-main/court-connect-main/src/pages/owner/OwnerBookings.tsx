import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { venues } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Calendar, Clock, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimeRange } from '@/lib/utils';

const statusColors = {
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const OwnerBookings = () => {
  const { bookings } = useData();
  const { user } = useAuth();
  const ownerVenues = venues.filter(v => v.ownerId === user?.id);
  const ownerBookings = bookings.filter(b => ownerVenues.some(v => v.id === b.venueId));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-6">Booking Overview</h1>
          <div className="space-y-3">
            {ownerBookings.map(b => (
              <Card key={b.id}>
                <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{b.venueName} - {b.courtName}</h4>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {b.userName}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTimeRange(b.startTime, b.endTime)} IST</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">₹{b.totalPrice}</span>
                    <Badge className={statusColors[b.status]} variant="outline">{b.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerBookings;
