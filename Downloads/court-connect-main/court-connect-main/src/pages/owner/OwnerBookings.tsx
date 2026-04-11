import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Calendar, Clock, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFacility } from '@/contexts/FacilityContext';
import { formatTimeRange } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const OwnerBookings = () => {
  const { bookings, updateBooking } = useData();
  const { user } = useAuth();
  const { getOwnerVenues } = useFacility();
  const ownerVenues = user ? getOwnerVenues(user.id, user.email) : [];
  const ownerBookings = bookings.filter(b => ownerVenues.some(v => v.id === b.venueId));

  const handleApprove = (bookingId: string) => {
    updateBooking(bookingId, { status: 'approved' });
    toast.success('Booking request approved');
  };

  const handleReject = (bookingId: string) => {
    updateBooking(bookingId, { status: 'rejected' });
    toast.success('Booking request rejected');
  };

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
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(b.id)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(b.id)}>Reject</Button>
                      </div>
                    )}
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
