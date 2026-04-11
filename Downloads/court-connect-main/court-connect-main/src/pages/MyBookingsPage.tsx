import { useState } from 'react';
import { Calendar, MapPin, Clock, XCircle, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatTimeRange } from '@/lib/utils';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const MyBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const { bookings, updateBooking } = useData();
  const userBookings = user ? bookings.filter(b => b.userId === user.id) : [];
  const filtered = statusFilter === 'all' ? userBookings : userBookings.filter(b => b.status === statusFilter);

  const handleCancel = (id: string) => {
    updateBooking(id, { status: 'cancelled' });
    toast.success('Booking cancelled successfully');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-bold">My Bookings</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No bookings found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <div key={booking.id} className="rounded-xl border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-lg">{booking.venueName}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">🏸 {booking.sportType}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {booking.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTimeRange(booking.startTime, booking.endTime)} IST</span>
                    </div>
                    <p className="text-sm">Court: <span className="font-medium">{booking.courtName}</span></p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={statusColors[booking.status]} variant="outline">
                      {(booking.status === 'confirmed' || booking.status === 'approved') && <CheckCircle className="h-3 w-3 mr-1" />}
                      {booking.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <p className="text-xl font-bold text-primary">₹{booking.totalPrice}</p>
                    {(booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'pending') && (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
