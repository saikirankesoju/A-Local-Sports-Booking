import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { venues, sports } from '@/data/mockData';
import VenueCard from '@/components/VenueCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ITEMS_PER_PAGE = 6;

const VenuesPage = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sportFilter, setSportFilter] = useState(searchParams.get('sport') || 'all');
  const [venueTypeFilter, setVenueTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = venues.filter(v => v.approved);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(v => v.name.toLowerCase().includes(s) || v.shortLocation.toLowerCase().includes(s));
    }
    if (sportFilter !== 'all') {
      result = result.filter(v => v.sports.some(sp => sp.name === sportFilter));
    }
    if (venueTypeFilter !== 'all') {
      result = result.filter(v => v.venueType === venueTypeFilter);
    }
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price-low') result.sort((a, b) => a.startingPrice - b.startingPrice);
    else if (sortBy === 'price-high') result.sort((a, b) => b.startingPrice - a.startingPrice);
    return result;
  }, [search, sportFilter, venueTypeFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="text-3xl font-display font-bold mb-6">Sports Venues</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search venues..." className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={sportFilter} onValueChange={v => { setSportFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sport" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map(s => <SelectItem key={s.id} value={s.name}>{s.icon} {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={venueTypeFilter} onValueChange={v => { setVenueTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Indoor">Indoor</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {paginated.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No venues found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(venue => <VenueCard key={venue.id} venue={venue} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VenuesPage;
