import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SkateSpotCreator from './SkateSpotCreator';
import SkateSpotCard from './SkateSpotCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Filter } from 'lucide-react';

interface SkateSpot {
  id: string;
  name: string;
  description?: string;
  location_name: string;
  image_url?: string;
  spot_type: string;
  difficulty_level: string;
  surface_type: string;
  is_public: boolean;
  is_legal: boolean;
  rating: number;
  ratings_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface SkateSpotFeedProps {
  showCreator?: boolean;
}

const SkateSpotFeed = ({ showCreator = true }: SkateSpotFeedProps) => {
  const { toast } = useToast();
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [spotTypeFilter, setSpotTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const loadSpots = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('skate_spots')
        .select(`
          id,
          name,
          description,
          location_name,
          image_url,
          spot_type,
          difficulty_level,
          surface_type,
          is_public,
          is_legal,
          rating,
          ratings_count,
          likes_count,
          comments_count,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (spotTypeFilter !== 'all') {
        query = query.eq('spot_type', spotTypeFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter);
      }

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('likes_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setSpots(data || []);
    } catch (error: any) {
      console.error('Error loading skate spots:', error);
      toast({
        title: "Error loading skate spots",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSpots();
  }, [spotTypeFilter, difficultyFilter, sortBy, searchTerm]);

  const handleSpotCreated = () => {
    loadSpots(true);
  };

  const handleSpotUpdate = () => {
    loadSpots(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading skate spots...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Spot Creator */}
      {showCreator && (
        <div className="mb-6">
          <SkateSpotCreator onSpotCreated={handleSpotCreated} />
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
            placeholder="Search spots by name, location, or description..."
            className="pl-10 bg-gray-800 border-roll-up-neon-green/50 text-white placeholder:text-gray-400 focus:border-roll-up-neon-green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          <Select value={spotTypeFilter} onValueChange={setSpotTypeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-roll-up-neon-green/50 text-white">
              <SelectValue placeholder="Spot Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="park">Skate Park</SelectItem>
              <SelectItem value="bowl">Bowl</SelectItem>
              <SelectItem value="vert">Vert Ramp</SelectItem>
              <SelectItem value="ledge">Ledge</SelectItem>
              <SelectItem value="rail">Rail</SelectItem>
              <SelectItem value="stairs">Stairs</SelectItem>
              <SelectItem value="gap">Gap</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-roll-up-neon-green/50 text-white">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-roll-up-neon-green/50 text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSpots(true)}
            disabled={isRefreshing}
            className="border-roll-up-neon-green/50 text-roll-up-neon-green hover:bg-roll-up-neon-green/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Spots List */}
      {spots.length > 0 ? (
        <div className="space-y-4">
          {spots.map((spot) => (
            <SkateSpotCard 
              key={spot.id} 
              spot={spot} 
              onSpotUpdate={handleSpotUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm || spotTypeFilter !== 'all' || difficultyFilter !== 'all'
              ? 'No skate spots found matching your filters.'
              : 'No skate spots shared yet.'
            }
          </p>
          {showCreator && !searchTerm && spotTypeFilter === 'all' && difficultyFilter === 'all' && (
            <p className="text-gray-500">
              Be the first to share a sick spot! 🛹
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkateSpotFeed;

