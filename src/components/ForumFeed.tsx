import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ForumTopicCreator from './ForumTopicCreator';
import ForumTopicCard from './ForumTopicCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Filter, MessageSquare } from 'lucide-react';

interface ForumTopic {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface ForumFeedProps {
  forumSlug: string;
  showCreator?: boolean;
}

const ForumFeed = ({ forumSlug, showCreator = true }: ForumFeedProps) => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [forumId, setForumId] = useState<string | null>(null);

  useEffect(() => {
    const fetchForumId = async () => {
      const { data, error } = await supabase
        .from('forums')
        .select('id')
        .eq('slug', forumSlug)
        .single();

      if (error) {
        console.error('Error fetching forum ID:', error);
        toast({
          title: "Error",
          description: "Could not load forum.",
          variant: "destructive"
        });
        return;
      }
      setForumId(data.id);
    };
    fetchForumId();
  }, [forumSlug]);

  useEffect(() => {
    if (forumId) {
      loadTopics();
    }
  }, [forumId, sortBy, searchTerm]);

  const loadTopics = async (refresh = false) => {
    if (!forumId) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          image_url,
          likes_count,
          comments_count,
          views_count,
          is_pinned,
          is_locked,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('forum_id', forumId)
        .eq('is_active', true);

      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'comments':
          query = query.order('comments_count', { ascending: false });
          break;
        case 'views':
          query = query.order('views_count', { ascending: false });
          break;
        case 'pinned':
          query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setTopics(data || []);
    } catch (error: any) {
      console.error('Error loading forum topics:', error);
      toast({
        title: "Error loading topics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleTopicCreated = () => {
    loadTopics(true);
  };

  const handleTopicUpdate = () => {
    loadTopics(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading forum topics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Topic Creator */}
      {showCreator && forumId && (
        <div className="mb-6">
          <ForumTopicCreator forumId={forumId} onTopicCreated={handleTopicCreated} />
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
            placeholder="Search topics by title or content..."
            className="pl-10 bg-gray-800 border-blue-500/50 text-white placeholder:text-gray-400 focus:border-blue-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Sort By:</span>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-blue-500/50 text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
              <SelectItem value="pinned">Pinned First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTopics(true)}
            disabled={isRefreshing}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Topics List */}
      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <ForumTopicCard 
              key={topic.id} 
              topic={topic} 
              onTopicUpdate={handleTopicUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm || sortBy !== 'newest'
              ? 'No topics found matching your filters.'
              : 'No forum topics posted yet.'
            }
          </p>
          {showCreator && !searchTerm && sortBy === 'newest' && (
            <p className="text-gray-500">
              Be the first to start a discussion! 💬
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ForumFeed;

