import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
import VenuesPage from "./pages/VenuesPage";
import VenueDetailPage from "./pages/VenueDetailPage";
import BookingPage from "./pages/BookingPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/venues/:id" element={<VenueDetailPage />} />
            <Route path="/book/:venueId" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/facilities" element={<FacilityManagement />} />
            <Route path="/owner/courts" element={<CourtManagement />} />
            <Route path="/owner/time-slots" element={<TimeSlotManagement />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<FacilityApprovals />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
