import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { courts, venues } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CourtManagement = () => {
  const ownerVenues = venues.filter(v => v.ownerId === 'o1');
  const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold">Court Management</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Court</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Court</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Venue</Label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select venue" /></SelectTrigger>
                      <SelectContent>{ownerVenues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Court Name</Label><Input placeholder="e.g. Court A" className="mt-1" /></div>
                  <div><Label>Sport Type</Label><Input placeholder="e.g. Badminton" className="mt-1" /></div>
                  <div><Label>Price per Hour (₹)</Label><Input type="number" placeholder="500" className="mt-1" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Opens At</Label><Input type="time" defaultValue="06:00" className="mt-1" /></div>
                    <div><Label>Closes At</Label><Input type="time" defaultValue="22:00" className="mt-1" /></div>
                  </div>
                  <Button className="w-full" onClick={() => { setOpen(false); toast.success('Court added!'); }}>Add Court</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {ownerCourts.map(court => {
              const venue = ownerVenues.find(v => v.id === court.venueId);
              return (
                <Card key={court.id}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{court.name}</h4>
                      <p className="text-sm text-muted-foreground">{venue?.name} • {court.sportType}</p>
                      <p className="text-sm text-muted-foreground">{court.operatingHoursStart} - {court.operatingHoursEnd}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">₹{court.pricePerHour}/hr</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourtManagement;
