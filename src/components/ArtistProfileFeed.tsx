import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ArtistProfileCard from './ArtistProfileCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ArtistProfile {
  id: string;
  created_at: string;
  user_id: string;
  artist_name: string;
  genre?: string;
  bio?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  social_links?: { instagram?: string; youtube?: string };
  contact_email?: string;
  is_featured: boolean;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface ArtistProfileFeedProps {
  showCreator?: boolean;
}

const ArtistProfileFeed: React.FC<ArtistProfileFeedProps> = ({ showCreator = false }) => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('artist_profiles')
        .select(`
          id,
          created_at,
          user_id,
          artist_name,
          genre,
          bio,
          profile_picture_url,
          cover_image_url,
          social_links,
          contact_email,
          is_featured,
          profiles(username, avatar_url)
        `);

      if (searchTerm) {
        query = query.or(`artist_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }
      if (filterGenre) {
        query = query.ilike('genre', `%${filterGenre}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setProfiles(data as ArtistProfile[]);
    } catch (err: any) {
      console.error('Error fetching artist profiles:', err.message);
      setError('Failed to load artist profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterGenre, sortBy, sortOrder]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleProfileCreated = () => {
    fetchProfiles();
  };

  const handleProfileUpdated = () => {
    fetchProfiles();
  };

  const handleProfileDeleted = () => {
    fetchProfiles();
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading artist profiles...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {showCreator && <ArtistProfileCreator onProfileCreated={handleProfileCreated} />}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
        />
        <Input
          type="text"
          placeholder="Filter by genre..."
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
            <SelectItem value="created_at">Date</SelectItem>
            <SelectItem value="artist_name">Artist Name</SelectItem>
            <SelectItem value="genre">Genre</SelectItem>
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
        <Button onClick={fetchProfiles} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Search className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>

      {profiles.length === 0 ? (
        <p className="text-center text-gray-400">No artist profiles found. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ArtistProfileCard 
              key={profile.id} 
              profile={profile} 
              onProfileUpdated={handleProfileUpdated}
              onProfileDeleted={handleProfileDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistProfileFeed;


