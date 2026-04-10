import { Users, Building2, CalendarCheck, Grid3X3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { courts } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useFacility } from '@/contexts/FacilityContext';
import { useData } from '@/contexts/DataContext';

const bookingActivity = [
  { month: 'Jan', bookings: 45 }, { month: 'Feb', bookings: 72 },
  { month: 'Mar', bookings: 98 }, { month: 'Apr', bookings: 85 },
  { month: 'May', bookings: 110 }, { month: 'Jun', bookings: 135 },
];
const userTrends = [
  { month: 'Jan', users: 20 }, { month: 'Feb', users: 35 },
  { month: 'Mar', users: 52 }, { month: 'Apr', users: 68 },
  { month: 'May', users: 89 }, { month: 'Jun', users: 112 },
];
const sportData = [
  { name: 'Badminton', value: 45 }, { name: 'Football', value: 25 },
  { name: 'Tennis', value: 15 }, { name: 'Cricket', value: 10 }, { name: 'Other', value: 5 },
];
const COLORS = ['hsl(160, 84%, 29%)', 'hsl(120, 60%, 35%)', 'hsl(38, 92%, 50%)', 'hsl(15, 90%, 55%)', 'hsl(210, 70%, 45%)'];

const AdminDashboard = () => {
  const { getPendingVenues, getApprovedVenues } = useFacility();
  const { users, bookings } = useData();
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalOwners = users.filter(u => u.role === 'owner').length;
  const pendingVenues = getPendingVenues();
  const approvedVenues = getApprovedVenues();

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users },
    { label: 'Facility Owners', value: totalOwners, icon: Building2 },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck },
    { label: 'Active Courts', value: courts.length, icon: Grid3X3 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">Platform overview</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Booking Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(160, 84%, 39%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(160, 84%, 39%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Sport Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sportData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {sportData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Facility Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Approval</span>
                    <span className="text-lg font-bold text-amber-600">{pendingVenues.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: `${pendingVenues.length * 20}%`}} /></div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-lg font-bold text-green-600">{approvedVenues.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: `${approvedVenues.length * 10}%`}} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>New User Signups</span><span className="font-bold">12</span></li>
                  <li className="flex justify-between"><span>New Facilities</span><span className="font-bold">{pendingVenues.length + approvedVenues.length}</span></li>
                  <li className="flex justify-between"><span>Bookings Today</span><span className="font-bold">8</span></li>
                  <li className="flex justify-between"><span>Support Tickets</span><span className="font-bold">3</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
