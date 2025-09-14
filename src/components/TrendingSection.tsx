import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Flame, Eye, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingPost {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  post_type: string;
  created_at: string;
  page_id: string;
}

const TrendingSection = () => {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      // Get posts with highest engagement (likes + comments)
      const { data, error } = await supabase
        .from('page_posts')
        .select('*')
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrendingPosts(data || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <span>Trending Now</span>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {trendingPosts.length === 0 ? (
          <p className="text-gray-400 text-sm">No trending posts yet</p>
        ) : (
          <div className="space-y-3">
            {trendingPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className={`w-6 h-6 flex items-center justify-center text-xs ${
                    index === 0
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : index === 1
                      ? 'bg-gray-300 text-black border-gray-300'
                      : index === 2
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-gray-600 text-white border-gray-600'
                  }`}
                >
                  {index + 1}
                </Badge>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {post.title}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.comments_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.likes_count + post.comments_count * 2}</span>
                    </span>
                  </div>
                </div>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          className="w-full mt-3 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
          onClick={() => window.location.href = '/trending'}
        >
          View All Trending
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrendingSection;