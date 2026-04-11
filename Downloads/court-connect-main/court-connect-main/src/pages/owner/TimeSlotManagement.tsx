import { Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeSlots } from '@/contexts/TimeSlotsContext';
import { useFacility } from '@/contexts/FacilityContext';
import { useCourts } from '@/contexts/CourtsContext';
import { useData } from '@/contexts/DataContext';
import { formatTime } from '@/lib/utils';
import { generateCourtSlotsForDate } from '@/lib/slots';

const isOccupiedStatus = (status: string) => status !== 'cancelled' && status !== 'rejected';

const TimeSlotManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOwnerVenues } = useFacility();
  const { courts } = useCourts();
  const { bookings } = useData();
  const { blockSlot, unblockSlot, isSlotBlocked } = useTimeSlots();

  const ownerVenues = user ? getOwnerVenues(user.id, user.email) : [];
  const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));

  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (ownerCourts.length > 0 && !selectedCourt) {
      setSelectedCourt(ownerCourts[0].id);
    }
  }, [ownerCourts, selectedCourt]);

  const slots = useMemo(() => {
    if (!selectedCourt) return [];
    const court = ownerCourts.find(c => c.id === selectedCourt);
    return court ? generateCourtSlotsForDate(court, selectedDate) : [];
  }, [ownerCourts, selectedCourt, selectedDate]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const toggleBlockSlot = (slotId: string) => {
    if (isSlotBlocked(slotId)) {
      unblockSlot(slotId);
      toast.success('Slot unblocked');
    } else {
      blockSlot(slotId);
      toast.success('Slot blocked');
    }
  };

  const dateObj = new Date(selectedDate);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <p className="text-muted-foreground">Please log in to access time slot management.</p>
          </main>
        </div>
      </div>
    );
  }

  if (ownerVenues.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <h1 className="text-2xl font-display font-bold mb-6">Time Slot Management</h1>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No facilities found. Please create a facility first.</p>
                <Button onClick={() => navigate('/owner/facilities')}>Create Facility</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (ownerCourts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <OwnerSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <h1 className="text-2xl font-display font-bold mb-6">Time Slot Management</h1>
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No courts found. Please create a court first.</p>
                <Button onClick={() => navigate('/owner/courts')}>Create Court</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-6">Time Slot Management</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Court</label>
              <Select value={selectedCourt} onValueChange={value => setSelectedCourt(value)}>
                <SelectTrigger><SelectValue placeholder="Select court" /></SelectTrigger>
                <SelectContent>
                  {ownerCourts.map(court => {
                    const venue = ownerVenues.find(v => v.id === court.venueId);
                    return (
                      <SelectItem key={court.id} value={court.id}>
                        {venue?.name} - {court.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center p-2 bg-muted rounded-md">
                  <p className="font-semibold">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDateChange(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Available Slots - {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">All times shown in IST</p>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No time slots available for this date</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {slots.map(slot => {
                    const slotBlocked = isSlotBlocked(slot.id);
                    const slotBooked = bookings.some(
                      booking =>
                        booking.courtId === selectedCourt &&
                        booking.date === selectedDate &&
                        booking.startTime === slot.startTime &&
                        isOccupiedStatus(booking.status)
                    );
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          slotBlocked
                            ? 'bg-destructive/10 border-destructive/20'
                            : slotBooked || !slot.available
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-card hover:border-primary'
                        }`}
                      >
                        <p className="font-medium text-sm">{formatTime(slot.startTime)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(slot.endTime)}</p>
                        {(slotBooked || !slot.available) && !slotBlocked && (
                          <p className="text-xs font-medium text-orange-600 mt-1">Booked</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-xs h-7"
                          onClick={() => toggleBlockSlot(slot.id)}
                          disabled={(slotBooked || !slot.available) && !slotBlocked}
                        >
                          {slotBlocked ? (
                            <><Unlock className="h-3 w-3 mr-1" /> Unblock</>
                          ) : (
                            <><Lock className="h-3 w-3 mr-1" /> Block</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border border-gray-300 bg-card" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border border-orange-200 bg-orange-50" />
                <span>Booked by User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded border border-destructive/20 bg-destructive/10" />
                <span>Blocked by You</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TimeSlotManagement;
