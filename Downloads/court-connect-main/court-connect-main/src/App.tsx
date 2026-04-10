import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { FacilityProvider } from "@/contexts/FacilityContext";
import { DataProvider } from "@/contexts/DataContext";
import { CourtsProvider } from "@/contexts/CourtsContext";
import { TimeSlotsProvider } from "@/contexts/TimeSlotsContext";
import { useAuth } from "@/contexts/AuthContext";

// Future flags for React Router v7 compatibility
const futureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import HomePage from "./pages/HomePage";
import VenuesPage from "./pages/VenuesPage";
import VenueDetailPage from "./pages/VenueDetailPage";
import BookingPage from "./pages/BookingPage";
import QuickBookPage from "./pages/QuickBookPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfilePage from "./pages/ProfilePage";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import FacilityManagement from "./pages/owner/FacilityManagement";
import CourtManagement from "./pages/owner/CourtManagement";
import TimeSlotManagement from "./pages/owner/TimeSlotManagement";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerProfile from "./pages/owner/OwnerProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacilityApprovals from "./pages/admin/FacilityApprovals";
import UserManagement from "./pages/admin/UserManagement";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: 'admin' | 'owner' | 'user';
}

const getRoleHomePath = (role: 'admin' | 'owner' | 'user') => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'owner') return '/owner/dashboard';
  return '/';
};

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return element;
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <AuthProvider>
          <FacilityProvider>
            <CourtsProvider>
              <TimeSlotsProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={futureFlags}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/venues" element={<VenuesPage />} />
                      <Route path="/venues/:id" element={<VenueDetailPage />} />
                      <Route path="/quick-book" element={<ProtectedRoute element={<QuickBookPage />} requiredRole="user" />} />
                      <Route path="/book/:venueId" element={<ProtectedRoute element={<BookingPage />} requiredRole="user" />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/my-bookings" element={<ProtectedRoute element={<MyBookingsPage />} requiredRole="user" />} />
                      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                      {/* Owner Routes */}
                      <Route path="/owner/dashboard" element={<ProtectedRoute element={<OwnerDashboard />} requiredRole="owner" />} />
                      <Route path="/owner/facilities" element={<ProtectedRoute element={<FacilityManagement />} requiredRole="owner" />} />
                      <Route path="/owner/courts" element={<ProtectedRoute element={<CourtManagement />} requiredRole="owner" />} />
                      <Route path="/owner/time-slots" element={<ProtectedRoute element={<TimeSlotManagement />} requiredRole="owner" />} />
                      <Route path="/owner/bookings" element={<ProtectedRoute element={<OwnerBookings />} requiredRole="owner" />} />
                      <Route path="/owner/profile" element={<ProtectedRoute element={<OwnerProfile />} requiredRole="owner" />} />
                      {/* Admin Routes */}
                      <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
                      <Route path="/admin/approvals" element={<ProtectedRoute element={<FacilityApprovals />} requiredRole="admin" />} />
                      <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} requiredRole="admin" />} />
                      <Route path="/admin/profile" element={<ProtectedRoute element={<AdminProfile />} requiredRole="admin" />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </TimeSlotsProvider>
            </CourtsProvider>
          </FacilityProvider>
        </AuthProvider>
      </DataProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
