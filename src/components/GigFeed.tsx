import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GigCreator from './GigCreator';
import GigCard from './GigCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Filter, Calendar } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  description?: string;
  artist_name: string;
  venue_name: string;
  venue_address?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  ticket_price?: number;
  ticket_url?: string;
  contact_info?: string;
  image_url?: string;
  genre?: string;
  event_type: string;
  capacity?: number;
  age_restriction: string;
  is_free: boolean;
  is_featured: boolean;
  status: string;
  likes_count: number;
  comments_count: number;
  interested_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface GigFeedProps {
  showCreator?: boolean;
}

const GigFeed = ({ showCreator = true }: GigFeedProps) => {
  const { toast } = useToast();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const loadGigs = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('gigs')
        .select(`
          id,
          title,
          description,
          artist_name,
          venue_name,
          venue_address,
          event_date,
          event_time,
          end_time,
          ticket_price,
          ticket_url,
          contact_info,
          image_url,
          genre,
          event_type,
          capacity,
          age_restriction,
          is_free,
          is_featured,
          status,
          likes_count,
          comments_count,
          interested_count,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      if (timeFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (timeFilter === 'upcoming') {
          query = query.gte('event_date', today);
        } else if (timeFilter === 'past') {
          query = query.lt('event_date', today);
        } else if (timeFilter === 'this_week') {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          query = query.gte('event_date', today).lte('event_date', nextWeek.toISOString().split('T')[0]);
        }
      }

      if (priceFilter !== 'all') {
        if (priceFilter === 'free') {
          query = query.eq('is_free', true);
        } else if (priceFilter === 'paid') {
          query = query.eq('is_free', false);
        }
      }

      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,artist_name.ilike.%${searchTerm}%,venue_name.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
          query = query.order('event_date', { ascending: true });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('interested_count', { ascending: false });
          break;
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('event_date', { ascending: true });
          break;
        default:
          query = query.order('event_date', { ascending: true });
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setGigs(data || []);
    } catch (error: any) {
      console.error('Error loading gigs:', error);
      toast({
        title: "Error loading gigs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadGigs();
  }, [eventTypeFilter, timeFilter, priceFilter, sortBy, searchTerm]);

  const handleGigCreated = () => {
    loadGigs(true);
  };

  const handleGigUpdate = () => {
    loadGigs(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading gigs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Gig Creator */}
      {showCreator && (
        <div className="mb-6">
          <GigCreator onGigCreated={handleGigCreated} />
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gigs by title, artist, venue, or genre..."
            className="pl-10 bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-purple-500/50 text-white">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="concert">Concert</SelectItem>
              <SelectItem value="dj_set">DJ Set</SelectItem>
              <SelectItem value="open_mic">Open Mic</SelectItem>
              <SelectItem value="festival">Festival</SelectItem>
              <SelectItem value="club_night">Club Night</SelectItem>
              <SelectItem value="private_party">Private Party</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-purple-500/50 text-white">
              <SelectValue placeholder="When" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-purple-500/50 text-white">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-purple-500/50 text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="newest">Newest Posted</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="featured">Featured First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadGigs(true)}
            disabled={isRefreshing}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Gigs List */}
      {gigs.length > 0 ? (
        <div className="space-y-4">
          {gigs.map((gig) => (
            <GigCard 
              key={gig.id} 
              gig={gig} 
              onGigUpdate={handleGigUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm || eventTypeFilter !== 'all' || timeFilter !== 'all' || priceFilter !== 'all'
              ? 'No gigs found matching your filters.'
              : 'No gigs posted yet.'
            }
          </p>
          {showCreator && !searchTerm && eventTypeFilter === 'all' && timeFilter === 'all' && priceFilter === 'all' && (
            <p className="text-gray-500">
              Be the first to advertise your gig! 🎵
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GigFeed;

