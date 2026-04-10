import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useFacility } from '@/contexts/FacilityContext';

const FacilityApprovals = () => {
  const { getPendingVenues, getApprovedVenues, approveFacility, rejectFacility } = useFacility();

  const pending = getPendingVenues();
  const approved = getApprovedVenues();

  const handleApprove = (venueId: string, venueName: string) => {
    approveFacility(venueId);
    toast.success(`✓ ${venueName} approved successfully!`);
  };

  const handleReject = (venueId: string, venueName: string) => {
    rejectFacility(venueId);
    toast.error(`✗ ${venueName} rejected`);
  };

  const handleView = (venueName: string) => {
    toast.info(`👁️ Viewing details for ${venueName}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Facility Approvals</h1>
            <p className="text-muted-foreground mb-6">Review and approve pending facility requests</p>
          </div>

          {pending.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" /> Pending Approval ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(v => (
                  <Card key={v.id}>
                    <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{v.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {v.address}
                        </p>
                        {v.shortLocation && (
                          <p className="text-xs text-muted-foreground mt-1">{v.shortLocation}</p>
                        )}
                        <p className="text-sm text-foreground mt-2">{v.description}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleView(v.name)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(v.id, v.name)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(v.id, v.name)}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">No pending facilities - all submissions have been reviewed!</p>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">Approved Facilities ({approved.length})</h2>
          {approved.length > 0 ? (
            <div className="space-y-3">
              {approved.map(v => (
                <Card key={v.id}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{v.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {v.shortLocation || v.address}
                      </p>
                    </div>
                    <Badge>✓ Approved</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No approved facilities yet</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacilityApprovals;
