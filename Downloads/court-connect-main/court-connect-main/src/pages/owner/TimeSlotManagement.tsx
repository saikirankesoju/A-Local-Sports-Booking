import { Clock, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courts, venues, generateTimeSlots } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { useState } from 'react';
import { toast } from 'sonner';

const TimeSlotManagement = () => {
  const ownerVenues = venues.filter(v => v.ownerId === 'o1');
  const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));
  const [selectedCourt, setSelectedCourt] = useState(ownerCourts[0]?.id || '');
  const today = new Date().toISOString().split('T')[0];
  const slots = selectedCourt ? generateTimeSlots(selectedCourt, today) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-6">Time Slot Management</h1>

          <div className="mb-6">
            <Select value={selectedCourt} onValueChange={setSelectedCourt}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select court" /></SelectTrigger>
              <SelectContent>
                {ownerCourts.map(c => {
                  const v = ownerVenues.find(v => v.id === c.venueId);
                  return <SelectItem key={c.id} value={c.id}>{v?.name} - {c.name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Today's Slots</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {slots.map(slot => (
                  <div key={slot.id} className={`p-3 rounded-lg border text-center ${!slot.available ? 'bg-destructive/10 border-destructive/20' : 'bg-card'}`}>
                    <p className="font-medium text-sm">{slot.startTime}</p>
                    <p className="text-xs text-muted-foreground">{slot.endTime}</p>
                    <Button
                      variant="ghost" size="sm" className="mt-2 w-full text-xs"
                      onClick={() => toast.info(slot.available ? 'Slot blocked' : 'Slot unblocked')}
                    >
                      {slot.available ? <><Lock className="h-3 w-3 mr-1" /> Block</> : <><Unlock className="h-3 w-3 mr-1" /> Unblock</>}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TimeSlotManagement;
