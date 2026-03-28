import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { venues, courts, reviews } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const venue = venues.find(v => v.id === id);
  const venueCourts = courts.filter(c => c.venueId === id);
  const venueReviews = reviews.filter(r => r.venueId === id);

  if (!venue) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold">Venue not found</h2>
            <Button className="mt-4" onClick={() => navigate('/venues')}>Back to Venues</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="h-72 gradient-hero relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl opacity-20">{venue.sports[0]?.icon || '🏟️'}</span>
        </div>
        <div className="container relative h-full flex items-end pb-6">
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-primary-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold">{venue.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-lg font-bold">{venue.rating}</span>
                  <span className="text-sm text-muted-foreground">({venue.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {venue.sports.map(s => (
                  <Badge key={s.id} variant="secondary" className="text-sm">{s.icon} {s.name}</Badge>
                ))}
                <Badge variant="outline">{venue.venueType}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-display font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{venue.about}</p>
            </div>

            <div>
              <h2 className="text-xl font-display font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-display font-semibold mb-3">Available Courts</h2>
              <div className="grid gap-3">
                {venueCourts.map(court => (
                  <div key={court.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <h4 className="font-semibold">{court.name}</h4>
                      <p className="text-sm text-muted-foreground">{court.sportType} • {court.operatingHoursStart} - {court.operatingHoursEnd}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">₹{court.pricePerHour}</span>
                      <span className="text-sm text-muted-foreground">/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-display font-semibold mb-3">Reviews</h2>
              {venueReviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {venueReviews.map(review => (
                    <div key={review.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {review.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.userName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">{review.createdAt}</span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold">Book a Court</h3>
              <p className="text-muted-foreground text-sm mt-1">Starting from</p>
              <div className="mt-2">
                <span className="text-3xl font-bold text-primary">₹{venue.startingPrice}</span>
                <span className="text-muted-foreground">/hr</span>
              </div>
              <Button className="w-full mt-6" size="lg" onClick={() => navigate(`/book/${venue.id}`)}>
                Book Now
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">Free cancellation up to 2 hours before</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VenueDetailPage;
