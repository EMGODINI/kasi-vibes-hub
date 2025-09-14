import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RouteCard from './RouteCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Route {
  id: string;
  route_name: string;
  description?: string;
  start_location: string;
  end_location: string;
  distance_km?: number;
  duration_minutes?: number;
  route_path?: any; // JSONB
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface RouteFeedProps {
  showCreator?: boolean;
}

const RouteFeed: React.FC<RouteFeedProps> = ({ showCreator = false }) => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('routes')
        .select(`
          id,
          route_name,
          description,
          start_location,
          end_location,
          distance_km,
          duration_minutes,
          route_path,
          likes_count,
          comments_count,
          created_at,
          profiles(username, avatar_url)
        `)
        .eq('is_public', true);

      if (searchTerm) {
        query = query.or(`route_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,start_location.ilike.%${searchTerm}%,end_location.ilike.%${searchTerm}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setRoutes(data as Route[]);
    } catch (err: any) {
      console.error('Error fetching routes:', err.message);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleRouteCreated = () => {
    fetchRoutes();
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading routes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {showCreator && <RouteCreator onRouteCreated={handleRouteCreated} />}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
            <SelectItem value="created_at">Date</SelectItem>
            <SelectItem value="likes_count">Likes</SelectItem>
            <SelectItem value="distance_km">Distance</SelectItem>
            <SelectItem value="duration_minutes">Duration</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full md:w-[100px] bg-gray-800 border-orange-500/50 text-white">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchRoutes} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Search className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>

      {routes.length === 0 ? (
        <p className="text-center text-gray-400">No routes found. Be the first to share one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} onRouteUpdate={fetchRoutes} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteFeed;


