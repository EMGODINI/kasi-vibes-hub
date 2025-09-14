import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TrickVideoCard from './TrickVideoCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface TrickVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  trick_name?: string;
  difficulty?: number;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface TrickVideoFeedProps {
  showCreator?: boolean;
}

const TrickVideoFeed: React.FC<TrickVideoFeedProps> = ({ showCreator = false }) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<TrickVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('trick_videos')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          trick_name,
          difficulty,
          tags,
          likes_count,
          comments_count,
          created_at,
          profiles(username, avatar_url)
        `)
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,trick_name.ilike.%${searchTerm}%`);
      }
      if (filterDifficulty) {
        query = query.eq('difficulty', parseInt(filterDifficulty));
      }
      if (filterTag) {
        query = query.contains('tags', [filterTag]);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setVideos(data as TrickVideo[]);
    } catch (err: any) {
      console.error('Error fetching trick videos:', err.message);
      setError('Failed to load trick videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterDifficulty, filterTag, sortBy, sortOrder]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleVideoCreated = () => {
    fetchVideos();
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading trick videos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {showCreator && <TrickVideoCreator onVideoCreated={handleVideoCreated} />}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
        />
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
            <SelectItem value="">All Difficulties</SelectItem>
            <SelectItem value="1">1 - Beginner</SelectItem>
            <SelectItem value="2">2 - Easy</SelectItem>
            <SelectItem value="3">3 - Medium</SelectItem>
            <SelectItem value="4">4 - Hard</SelectItem>
            <SelectItem value="5">5 - Expert</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
            <SelectItem value="created_at">Date</SelectItem>
            <SelectItem value="likes_count">Likes</SelectItem>
            <SelectItem value="comments_count">Comments</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
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
        <Button onClick={fetchVideos} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Search className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400">No trick videos found. Be the first to upload one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <TrickVideoCard key={video.id} video={video} onVideoUpdate={fetchVideos} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrickVideoFeed;


