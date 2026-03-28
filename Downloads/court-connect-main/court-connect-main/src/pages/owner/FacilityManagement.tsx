import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { venues } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Plus, Edit, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const FacilityManagement = () => {
  const ownerVenues = venues.filter(v => v.ownerId === 'o1');
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold">Facility Management</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Facility</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Add New Facility</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input placeholder="Facility name" className="mt-1" /></div>
                  <div><Label>Location</Label><Input placeholder="Full address" className="mt-1" /></div>
                  <div><Label>Description</Label><Textarea placeholder="Describe your facility..." className="mt-1" /></div>
                  <div><Label>Supported Sports</Label><Input placeholder="e.g. Badminton, Tennis" className="mt-1" /></div>
                  <div><Label>Amenities</Label><Input placeholder="e.g. Parking, Cafeteria" className="mt-1" /></div>
                  <Button className="w-full" onClick={() => { setOpen(false); toast.success('Facility added!'); }}>Submit for Approval</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {ownerVenues.map(venue => (
              <Card key={venue.id}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold">{venue.name}</h3>
                        <Badge variant={venue.approved ? 'default' : 'secondary'}>
                          {venue.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {venue.address}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {venue.sports.map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">{s.icon} {s.name}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {venue.amenities.map(a => (
                          <span key={a} className="text-xs bg-muted px-2 py-1 rounded">{a}</span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button>
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

export default FacilityManagement;
