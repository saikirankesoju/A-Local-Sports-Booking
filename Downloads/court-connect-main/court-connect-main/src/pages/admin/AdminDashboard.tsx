import { Users, Building2, CalendarCheck, Grid3X3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allUsers, venues, bookings, courts } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
  const totalUsers = allUsers.filter(u => u.role === 'user').length;
  const totalOwners = allUsers.filter(u => u.role === 'owner').length;

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
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Booking Activity</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bookingActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                    <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                    <Bar dataKey="bookings" fill="hsl(160, 84%, 29%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">User Registration Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                    <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(38, 92%, 50%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Most Active Sports</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sportData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {sportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
