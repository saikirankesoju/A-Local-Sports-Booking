import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courts, venues, generateTimeSlots, sports } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useTimeSlots } from '@/contexts/TimeSlotsContext';
import { formatTime, formatTimeRange } from '@/lib/utils';

const QuickBookPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addBooking, bookings } = useData();
  const { bookSlot } = useTimeSlots();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  // Generate dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Filter courts based on selected sport and venue
  const filteredCourts = useMemo(() => {
    let result = courts;
    
    if (selectedVenue !== 'all') {
      result = result.filter(c => c.venueId === selectedVenue);
    }
    
    if (selectedSport !== 'all') {
      result = result.filter(c => c.sportType === selectedSport);
    }
    
    return result;
  }, [selectedSport, selectedVenue]);

  const availableVenues = useMemo(() => {
    return venues.filter(v => v.approved && courts.some(c => c.venueId === v.id));
  }, []);

  const uniqueSports = useMemo(() => {
    const sportSet = new Set(courts.map(c => c.sportType));
    return Array.from(sportSet);
  }, []);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleBookSlot = (courtId: string, slotId: string, timeSlot: any) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    const court = courts.find(c => c.id === courtId);
    const venue = venues.find(v => v.id === court?.venueId);

    if (!court || !venue) return;

    // Check if already booked
    const existingBooking = bookings.find(
      b => b.courtId === courtId && 
           b.date === selectedDate && 
           b.startTime === timeSlot.startTime &&
           b.status !== 'cancelled'
    );

    if (existingBooking) {
      toast.error('This slot is already booked');
      return;
    }

    const newBooking = {
      id: `b${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      venueId: venue.id,
      venueName: venue.name,
      courtId: court.id,
      courtName: court.name,
      sportType: court.sportType,
      date: selectedDate,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      totalPrice: court.pricePerHour,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addBooking(newBooking);
    bookSlot(slotId);
    setBookingSlot(null);
    toast.success(`Court booked successfully for ${timeSlot.startTime}!`);
  };

  const dateObj = new Date(selectedDate);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="text-3xl font-display font-bold mb-2">Quick Book</h1>
        <p className="text-muted-foreground mb-8">Browse courts and book your preferred time slot instantly</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Date Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center p-3 bg-muted rounded-lg">
                <p className="font-semibold text-sm">{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDateChange(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sport Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Filter by Sport</label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {uniqueSports.map(sport => (
                  <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Venue Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Filter by Venue</label>
            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venues</SelectItem>
                {availableVenues.map(venue => (
                  <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courts with Time Slots */}
        {filteredCourts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No courts found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCourts.map(court => {
              const venue = venues.find(v => v.id === court.venueId);
              const timeSlots = generateTimeSlots(court.id, selectedDate);

              return (
                <Card key={court.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {court.name}
                          <Badge variant="outline">{court.sportType}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {venue?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{court.pricePerHour}</p>
                        <p className="text-xs text-muted-foreground">per hour</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Operating: {formatTimeRange(court.operatingHoursStart, court.operatingHoursEnd)} IST
                    </p>
                    
                    {/* Time Slots Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {timeSlots.map(slot => {
                        const isBooked = bookings.some(
                          b => b.courtId === court.id && 
                               b.date === selectedDate && 
                               b.startTime === slot.startTime &&
                               b.status !== 'cancelled'
                        );
                        const isSelected = bookingSlot === slot.id;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => !isBooked && handleBookSlot(court.id, slot.id, slot)}
                            disabled={!slot.available || isBooked}
                            className={`p-2 text-sm font-medium rounded-lg border-2 transition-all ${
                              !slot.available || isBooked
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                : isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-muted hover:border-primary/30 hover:bg-muted/50'
                            }`}
                            title={isBooked ? 'Already booked' : slot.available ? 'Available' : 'Not available'}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default QuickBookPage;
