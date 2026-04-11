import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { Plus, Edit, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFacility } from '@/contexts/FacilityContext';
import { useCourts } from '@/contexts/CourtsContext';
import { Venue, Court } from '@/types';

const FacilityManagement = () => {
  const { user } = useAuth();
  const { getOwnerVenues, addVenue, updateVenue } = useFacility();
  const { addCourt } = useCourts();
  const ownerVenues = user ? getOwnerVenues(user.id, user.email) : [];
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    shortLocation: '',
    description: '',
    about: '',
    sports: '',
    amenities: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.address || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      // Update existing facility
      updateVenue(editingId, {
        name: formData.name,
        address: formData.address,
        shortLocation: formData.shortLocation,
        description: formData.description,
        about: formData.about,
      });
      toast.success(formData.name + ' updated successfully!');
    } else {
      // Add new facility
      const newVenue: Venue = {
        id: `v${Date.now()}`,
        name: formData.name,
        address: formData.address,
        shortLocation: formData.shortLocation,
        description: formData.description,
        about: formData.about,
        ownerId: user?.id || '',
        approved: false,
        rating: 0,
        reviewCount: 0,
        startingPrice: 500,
        venueType: 'Indoor',
        sports: [],
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        photos: [],
      };
      addVenue(newVenue);
      
      // Create 2 default courts for the new facility
      const court1: Court = {
        id: `c${Date.now()}-1`,
        venueId: newVenue.id,
        name: `Court A`,
        sportType: 'General',
        pricePerHour: 500,
        operatingHoursStart: '06:00',
        operatingHoursEnd: '22:00',
      };
      const court2: Court = {
        id: `c${Date.now()}-2`,
        venueId: newVenue.id,
        name: `Court B`,
        sportType: 'General',
        pricePerHour: 500,
        operatingHoursStart: '06:00',
        operatingHoursEnd: '22:00',
      };
      addCourt(court1);
      addCourt(court2);
      
      toast.success('Facility submitted for approval! Courts created automatically.');
    }

    setFormData({ name: '', address: '', shortLocation: '', description: '', about: '', sports: '', amenities: '' });
    setEditingId(null);
    setOpen(false);
  };

  const handleEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setFormData({
      name: venue.name,
      address: venue.address,
      shortLocation: venue.shortLocation,
      description: venue.description,
      about: venue.about,
      sports: '',
      amenities: venue.amenities.join(', '),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({ name: '', address: '', shortLocation: '', description: '', about: '', sports: '', amenities: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">Facility Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your sports facilities and venues</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingId(null)}><Plus className="h-4 w-4 mr-2" /> Add Facility</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingId ? 'Edit Facility' : 'Add New Facility'}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Facility Name *</Label>
                    <Input placeholder="e.g. GreenField Arena" name="name" value={formData.name} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label>Full Address *</Label>
                    <Input placeholder="Full address" name="address" value={formData.address} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label>Short Location</Label>
                    <Input placeholder="e.g. Koramangala, Bangalore" name="shortLocation" value={formData.shortLocation} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea placeholder="Brief description of your facility" name="description" value={formData.description} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label>About</Label>
                    <Textarea placeholder="Detailed information about your facility" name="about" value={formData.about} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <div>
                    <Label>Amenities</Label>
                    <Input placeholder="e.g. Parking, Cafeteria, Changing Room (comma-separated)" name="amenities" value={formData.amenities} onChange={handleInputChange} className="mt-1" />
                  </div>
                  <Button className="w-full" onClick={handleSubmit}>
                    {editingId ? 'Update Facility' : 'Submit for Approval'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {ownerVenues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No facilities yet. Add your first facility to get started!</p>
                <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Your First Facility</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ownerVenues.map(venue => (
                <Card key={venue.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-semibold">{venue.name}</h3>
                          <Badge variant={venue.approved ? 'default' : 'secondary'}>
                            {venue.approved ? '✓ Approved' : '⏳ Pending Approval'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {venue.address}
                        </p>
                        {venue.shortLocation && (
                          <p className="text-xs text-muted-foreground mt-1">{venue.shortLocation}</p>
                        )}
                        <p className="text-sm text-foreground mt-2">{venue.description}</p>
                        {venue.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {venue.amenities.map(a => (
                              <span key={a} className="text-xs bg-muted px-2 py-1 rounded">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(venue)}>
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacilityManagement;
