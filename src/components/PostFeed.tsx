import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface PostFeedProps {
  pageSlug?: string;
  showCreator?: boolean;
}

const PostFeed = ({ pageSlug, showCreator = true }: PostFeedProps) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPosts = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      // Filter by page if specified
      if (pageSlug) {
        query = query.eq('page_slug', pageSlug);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [pageSlug]);

  const handlePostCreated = () => {
    loadPosts(true);
  };

  const handlePostUpdate = () => {
    loadPosts(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Post Creator */}
      {showCreator && (
        <PostCreator 
          pageSlug={pageSlug} 
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">
          {pageSlug ? `${pageSlug.replace('-', ' ')} Posts` : 'Recent Posts'}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadPosts(true)}
          disabled={isRefreshing}
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdate={handlePostUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-4">
            {pageSlug 
              ? `No posts in ${pageSlug.replace('-', ' ')} yet.` 
              : 'No posts yet.'
            }
          </p>
          {showCreator && (
            <p className="text-gray-500">
              Be the first to share something!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;

