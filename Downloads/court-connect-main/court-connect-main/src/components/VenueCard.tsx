import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Venue } from '@/types';
import { Badge } from '@/components/ui/badge';

const VenueCard = ({ venue }: { venue: Venue }) => (
  <Link to={`/venues/${venue.id}`} className="group block">
    <div className="rounded-xl border bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="h-44 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-30">{venue.sports[0]?.icon || '🏟️'}</span>
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5">
          {venue.sports.map(sport => (
            <Badge key={sport.id} variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground text-xs">
              {sport.icon} {sport.name}
            </Badge>
          ))}
        </div>
        <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs">
          {venue.venueType}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
          <MapPin className="h-3.5 w-3.5" />
          {venue.shortLocation}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold">{venue.rating}</span>
            <span className="text-xs text-muted-foreground">({venue.reviewCount})</span>
          </div>
          <div>
            <span className="text-lg font-bold text-primary">₹{venue.startingPrice}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default VenueCard;
