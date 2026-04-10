import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sports } from '@/data/mockData';
import { useFacility } from '@/contexts/FacilityContext';
import { useAuth } from '@/contexts/AuthContext';
import VenueCard from '@/components/VenueCard';
import heroBanner from '@/assets/hero-banner.svg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const { getApprovedVenues } = useFacility();
  const popularVenues = getApprovedVenues().slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[520px] overflow-hidden">
        <img src={heroBanner} alt="Sports facilities" className="absolute inset-0 w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        <div className="relative container h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground max-w-2xl leading-tight">
            Book Your Court,<br />
            <span className="text-accent">Play Your Game</span>
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg">
            Find and book the best sports facilities near you. Badminton, football, tennis, and more.
          </p>
          <div className="mt-8 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues or sports..."
                className="pl-10 h-12 bg-card border-0"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && navigate(`/venues?search=${search}`)}
              />
            </div>
            <Button size="lg" className="h-12 px-6" onClick={() => navigate(`/venues?search=${search}`)}>
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Book CTA - Only for authenticated users */}
      {isAuthenticated && user?.role === 'user' && (
        <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-12 border-b">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold text-accent">QUICK BOOKING</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Browse & Book All Courts Instantly</h3>
                <p className="text-muted-foreground max-w-lg">
                  View all available courts and their time slots at once. No need to browse venues one by one. Book your favorite slot in seconds.
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate('/quick-book')}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Quick Book Now
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Popular Sports */}
      <section className="container py-16">
        <h2 className="text-2xl font-display font-bold mb-8">Popular Sports</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => navigate(`/venues?sport=${sport.name}`)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl">{sport.icon}</span>
              <span className="text-sm font-medium">{sport.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Venues */}
      <section className="container pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">Popular Venues</h2>
          <Button variant="ghost" onClick={() => navigate('/venues')} className="text-primary">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularVenues.map(venue => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-display font-bold text-primary-foreground">Own a Sports Facility?</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            List your venue on QuickCourt and reach thousands of sports enthusiasts.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" onClick={() => navigate('/signup')}>
            Register as Owner
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
