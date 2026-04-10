import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFacility } from '@/contexts/FacilityContext';
import { useCourts } from '@/contexts/CourtsContext';
import { Court } from '@/types';

const CourtManagement = () => {
  const { user } = useAuth();
  const { getOwnerVenues } = useFacility();
  const { courts, addCourt, deleteCourt } = useCourts();
  
  const ownerVenues = getOwnerVenues(user?.id || '');
  const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));
  
  const [open, setOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [courtName, setCourtName] = useState('');
  const [sportType, setSportType] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [opensAt, setOpensAt] = useState('06:00');
  const [closesAt, setClosesAt] = useState('22:00');

  const handleAddCourt = () => {
    if (!selectedVenue || !courtName || !sportType || !pricePerHour) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCourt: Court = {
      id: `c${Date.now()}`,
      venueId: selectedVenue,
      name: courtName,
      sportType: sportType,
      pricePerHour: parseInt(pricePerHour),
      operatingHoursStart: opensAt,
      operatingHoursEnd: closesAt,
    };

    addCourt(newCourt);
    toast.success('Court added successfully!');
    
    // Reset form
    setSelectedVenue('');
    setCourtName('');
    setSportType('');
    setPricePerHour('');
    setOpensAt('06:00');
    setClosesAt('22:00');
    setOpen(false);
  };

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
                    <Label>Venue *</Label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select venue" /></SelectTrigger>
                      <SelectContent>
                        {ownerVenues.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No venues yet. Create a facility first.</div>
                        ) : (
                          ownerVenues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Court Name *</Label>
                    <Input 
                      placeholder="e.g. Court A" 
                      className="mt-1" 
                      value={courtName}
                      onChange={(e) => setCourtName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sport Type *</Label>
                    <Input 
                      placeholder="e.g. Badminton" 
                      className="mt-1"
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Price per Hour (₹) *</Label>
                    <Input 
                      type="number" 
                      placeholder="500" 
                      className="mt-1"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Opens At</Label>
                      <Input 
                        type="time" 
                        value={opensAt}
                        onChange={(e) => setOpensAt(e.target.value)}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label>Closes At</Label>
                      <Input 
                        type="time" 
                        value={closesAt}
                        onChange={(e) => setClosesAt(e.target.value)}
                        className="mt-1" 
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddCourt}
                  >
                    Add Court
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {ownerCourts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No courts yet. Add your first court to get started!</p>
                </CardContent>
              </Card>
            ) : (
              ownerCourts.map(court => {
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => {
                              deleteCourt(court.id);
                              toast.success('Court deleted!');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourtManagement;
