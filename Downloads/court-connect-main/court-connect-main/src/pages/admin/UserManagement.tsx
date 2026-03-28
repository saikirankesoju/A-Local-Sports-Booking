import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allUsers, bookings } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { Search, Ban, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = allUsers.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-6">User Management</h1>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map(u => {
              const userBookings = bookings.filter(b => b.userId === u.id);
              return (
                <Card key={u.id}>
                  <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                        {u.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold">{u.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                      <span className="text-sm text-muted-foreground">{userBookings.length} bookings</span>
                      <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast.info('User banned')}>
                        <Ban className="h-3.5 w-3.5 mr-1" /> Ban
                      </Button>
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

export default UserManagement;
