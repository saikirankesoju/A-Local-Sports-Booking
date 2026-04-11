import { CalendarCheck, Grid3X3, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { courts, venues } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import OwnerSidebar from '@/components/OwnerSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { isOwnedByUser } from '@/lib/utils';

const weeklyData = [
  { day: 'Mon', bookings: 12 }, { day: 'Tue', bookings: 19 },
  { day: 'Wed', bookings: 8 }, { day: 'Thu', bookings: 15 },
  { day: 'Fri', bookings: 22 }, { day: 'Sat', bookings: 30 },
  { day: 'Sun', bookings: 25 },
];

const earningsData = [
  { month: 'Jan', earnings: 12000 }, { month: 'Feb', earnings: 18000 },
  { month: 'Mar', earnings: 24000 }, { month: 'Apr', earnings: 20000 },
  { month: 'May', earnings: 28000 }, { month: 'Jun', earnings: 32000 },
];

const peakHoursData = [
  { hour: '6am', bookings: 5 }, { hour: '8am', bookings: 12 },
  { hour: '10am', bookings: 8 }, { hour: '12pm', bookings: 6 },
  { hour: '2pm', bookings: 4 }, { hour: '4pm', bookings: 15 },
  { hour: '6pm', bookings: 28 }, { hour: '8pm', bookings: 22 },
  { hour: '10pm', bookings: 10 },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { bookings } = useData();
  const ownerVenues = venues.filter(v => isOwnedByUser(v.ownerId, user));
  const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));
  const totalBookings = bookings.filter(b => ownerVenues.some(v => v.id === b.venueId)).length;
  const totalEarnings = bookings.filter(b => ownerVenues.some(v => v.id === b.venueId) && b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);

  const stats = [
    { label: 'Total Bookings', value: totalBookings, icon: CalendarCheck, color: 'text-primary' },
    { label: 'Active Courts', value: ownerCourts.length, icon: Grid3X3, color: 'text-sport-tennis' },
    { label: 'Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
    { label: 'This Week', value: '+12%', icon: TrendingUp, color: 'text-sport-basketball' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <OwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-display font-bold mb-1">Welcome back, {user?.fullName || 'Owner'}</h1>
          <p className="text-muted-foreground mb-8">Here's your facility overview</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Booking Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(160, 84%, 29%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Earnings Summary</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Peak Booking Hours</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
                    <XAxis dataKey="hour" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="hsl(160, 84%, 29%)" fill="hsl(160, 84%, 29%)" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
