import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { venues } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';

const FacilityApprovals = () => {
  const pending = venues.filter(v => !v.approved);
  const approved = venues.filter(v => v.approved);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-6">Facility Approvals</h1>

          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" /> Pending Approval ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(v => (
                  <Card key={v.id}>
                    <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{v.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {v.address}</p>
                        <div className="flex gap-1.5 mt-2">
                          {v.sports.map(s => <Badge key={s.id} variant="outline" className="text-xs">{s.icon} {s.name}</Badge>)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                        <Button size="sm" onClick={() => toast.success('Facility approved!')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => toast.info('Facility rejected')}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">Approved Facilities ({approved.length})</h2>
          <div className="space-y-3">
            {approved.map(v => (
              <Card key={v.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{v.name}</h4>
                    <p className="text-sm text-muted-foreground">{v.shortLocation}</p>
                  </div>
                  <Badge>Approved</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacilityApprovals;
