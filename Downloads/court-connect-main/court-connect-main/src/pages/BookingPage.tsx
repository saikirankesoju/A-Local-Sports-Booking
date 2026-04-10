import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateTimeSlots } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useFacility } from '@/contexts/FacilityContext';
import { useCourts } from '@/contexts/CourtsContext';
import { useData } from '@/contexts/DataContext';
import { useTimeSlots } from '@/contexts/TimeSlotsContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime, formatTimeRange } from '@/lib/utils';

const BookingPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { venues } = useFacility();
  const { getVenueCourts } = useCourts();
  const { addBooking, bookings } = useData();
  const { bookSlot } = useTimeSlots();
  
  const venue = venues.find(v => v.id === venueId);
  const venueCourts = getVenueCourts(venueId || '');

  const todayDate = new Date().toISOString().split('T')[0];

  // Get first court ID directly from venueCourts
  const firstCourtId = venueCourts.length > 0 ? venueCourts[0].id : '';

  const [selectedCourt, setSelectedCourt] = useState(firstCourtId);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Update selectedCourt if firstCourtId changes (when venueCourts load)
  useEffect(() => {
    if (firstCourtId && selectedCourt !== firstCourtId) {
      setSelectedCourt(firstCourtId);
    }
  }, [firstCourtId, selectedCourt]);

  const court = venueCourts.find(c => c.id === selectedCourt);
  const timeSlots = selectedCourt && selectedDate ? generateTimeSlots(selectedCourt, selectedDate) : [];
  const slot = timeSlots.find(s => s.id === selectedSlot);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Check if a slot is booked
  const isSlotBooked = (slotId: string) => {
    return bookings.some(b => {
      const booking = bookings.find(bk => bk.id);
      return b.courtId === selectedCourt && b.date === selectedDate && b.status !== 'cancelled';
    });
  };

  const handleConfirm = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to book a court');
      navigate('/login');
      return;
    }
    
    if (!court || !slot || !venue) {
      toast.error('Please select all options');
      return;
    }

    // Check if slot is already booked
    const existingBooking = bookings.find(
      b => b.courtId === selectedCourt && 
           b.date === selectedDate && 
           b.startTime === slot.startTime &&
           b.status !== 'cancelled'
    );

    if (existingBooking) {
      toast.error('This slot has been booked by another user. Please select a different time.');
      return;
    }
    
    // Create booking
    const booking = {
      id: `b${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      venueId: venue.id,
      venueName: venue.name,
      courtId: court.id,
      courtName: court.name,
      sportType: court.sportType,
      date: selectedDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      totalPrice: court.pricePerHour,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    addBooking(booking);
    bookSlot(slot.id);
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

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Book a Court</h1>
          <p className="text-lg text-muted-foreground">{venue?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Select Court */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-semibold mb-4">Step 1: Select Court</h3>
                {venueCourts.length === 0 ? (
                  <p className="text-muted-foreground">No courts available for this venue</p>
                ) : (
                  <div className="grid gap-3">
                    {venueCourts.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCourt(c.id); setSelectedSlot(''); }}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          selectedCourt === c.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-base">{c.name}</p>
                          <p className="text-sm text-muted-foreground">{c.sportType} • {formatTimeRange(c.operatingHoursStart, c.operatingHoursEnd)} IST</p>
                        </div>
                        <span className="font-bold text-lg text-primary">₹{c.pricePerHour}/hr</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Select Date */}
            {selectedCourt && (
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-4">Step 2: Select Date</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {dates.map(date => {
                      const d = new Date(date);
                      return (
                        <button
                          key={date}
                          onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            selectedDate === date ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="font-semibold text-lg">{d.getDate()}</p>
                          <p className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Select Time Slot */}
            {selectedDate && (
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-4">Step 3: Select Time Slot</h3>
                  {timeSlots.length === 0 ? (
                    <p className="text-muted-foreground">No time slots available</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map(ts => {
                        const isBooked = bookings.some(
                          b => b.courtId === selectedCourt && 
                               b.date === selectedDate && 
                               b.startTime === ts.startTime &&
                               b.status !== 'cancelled'
                        );
                        return (
                          <button
                            key={ts.id}
                            disabled={!ts.available || isBooked}
                            onClick={() => setSelectedSlot(ts.id)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              !ts.available || isBooked ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-muted' :
                              selectedSlot === ts.id ? 'border-primary bg-primary text-primary-foreground' :
                              'border-muted hover:border-primary/30'
                            }`}
                            title={isBooked ? 'Already booked' : ''}
                          >
                            {formatTime(ts.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-semibold mb-6">Booking Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-medium text-right max-w-[120px] break-words">{venue?.name}</span>
                  </div>
                  {court && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Court</span>
                      <span className="font-medium text-right">{court.name}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-right">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {slot && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-right">{formatTimeRange(slot.startTime, slot.endTime)} IST</span>
                    </div>
                  )}
                  {court && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Price/Hour</span>
                      <span className="font-medium text-right">₹{court.pricePerHour}</span>
                    </div>
                  )}
                  <div className="border-t pt-4 mt-4 flex justify-between items-center">
                    <span className="font-semibold text-base">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{(court?.pricePerHour || 0)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 py-6 text-base" 
                  disabled={!selectedSlot || !venue || !court || !slot} 
                  onClick={handleConfirm}
                >
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
