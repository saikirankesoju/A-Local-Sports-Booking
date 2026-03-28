import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { venues, courts, generateTimeSlots } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const BookingPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const venue = venues.find(v => v.id === venueId);
  const venueCourts = courts.filter(c => c.venueId === venueId);

  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const court = venueCourts.find(c => c.id === selectedCourt);
  const timeSlots = selectedCourt && selectedDate ? generateTimeSlots(selectedCourt, selectedDate) : [];
  const slot = timeSlots.find(s => s.id === selectedSlot);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const handleConfirm = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a court');
      navigate('/login');
      return;
    }
    setConfirmed(true);
    toast.success('Booking confirmed!');
  };

  if (!venue) return null;

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold">Booking Confirmed!</h2>
            <p className="text-muted-foreground mt-2">Your court has been booked successfully.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
              <Button variant="outline" onClick={() => navigate('/venues')}>Browse More</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <h1 className="text-3xl font-display font-bold mb-2">Book a Court</h1>
        <p className="text-muted-foreground mb-8">{venue.name}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Select Court */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">1. Select Court</h3>
              <div className="grid gap-3">
                {venueCourts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCourt(c.id); setSelectedSlot(''); }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      selectedCourt === c.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.sportType}</p>
                    </div>
                    <span className="font-bold text-primary">₹{c.pricePerHour}/hr</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Date */}
            {selectedCourt && (
              <div className="rounded-xl border bg-card p-6 animate-fade-in">
                <h3 className="font-display font-semibold mb-4">2. Select Date</h3>
                <div className="flex flex-wrap gap-2">
                  {dates.map(date => {
                    const d = new Date(date);
                    return (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
                        className={`px-4 py-3 rounded-lg border text-center transition-all min-w-[80px] ${
                          selectedDate === date ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'
                        }`}
                      >
                        <p className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className="font-semibold">{d.getDate()}</p>
                        <p className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Time Slot */}
            {selectedDate && (
              <div className="rounded-xl border bg-card p-6 animate-fade-in">
                <h3 className="font-display font-semibold mb-4">3. Select Time Slot</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map(ts => (
                    <button
                      key={ts.id}
                      disabled={!ts.available}
                      onClick={() => setSelectedSlot(ts.id)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        !ts.available ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' :
                        selectedSlot === ts.id ? 'border-primary bg-primary text-primary-foreground' :
                        'hover:border-primary/30'
                      }`}
                    >
                      {ts.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-medium">{venue.name}</span>
                </div>
                {court && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Court</span>
                    <span className="font-medium">{court.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {slot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">₹{court?.pricePerHour || 0}</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="lg" disabled={!selectedSlot} onClick={handleConfirm}>
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
