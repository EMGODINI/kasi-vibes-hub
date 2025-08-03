import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Flag,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PostCreationModal from '@/components/PostCreationModal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  post_type: string;
  created_at: string;
  created_by: string;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  user_likes: string[];
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const SkatersFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('page_posts')
        .select(`
          id,
          title,
          content,
          image_url,
          post_type,
          created_at,
          created_by,
          is_featured,
          likes_count,
          comments_count,
          user_likes
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile data separately for each post
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.created_by)
            .single();
            
          return {
            ...post,
            profiles: profile
          };
        })
      );
      
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to like posts',
        variant: 'destructive'
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.user_likes.includes(user.id);

      if (isLiked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update local state optimistically
      setPosts(posts.map(p => 
        p.id === postId 
          ? {
              ...p,
              likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
              user_likes: isLiked 
                ? p.user_likes.filter(id => id !== user.id)
                : [...p.user_likes, user.id]
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive'
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('page_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      toast({
        title: 'Success',
        description: 'Post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your Skating Story
          </Button>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className={`hover:shadow-lg transition-all duration-300 ${
              post.is_featured ? 'border-orange-200 bg-gradient-to-r from-orange-50/50 to-red-50/50' : ''
            }`}
          >
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="hover:scale-105 transition-transform">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.profiles?.username}</span>
                      {post.is_featured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{post.post_type}</Badge>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Three Dots Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.id === post.created_by ? (
                      <>
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deletePost(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem className="text-red-600">
                        <Flag className="h-4 w-4 mr-2" />
                        Report Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                {post.content && (
                  <p className="text-muted-foreground mb-3">{post.content}</p>
                )}
                
                {post.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Post content" 
                      className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`hover:bg-red-50 transition-all duration-200 ${
                      user && post.user_likes.includes(user.id) 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 transition-all duration-200 ${
                        user && post.user_likes.includes(user.id) 
                          ? 'fill-current' 
                          : ''
                      }`} 
                    />
                    {post.likes_count}
                  </Button>

                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {post.comments_count}
                  </Button>

                  <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-all duration-200">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              No posts yet. Be the first to share something!
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Create First Post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pageId="skaters-street"
        onPostCreated={fetchPosts}
      />
    </div>
  );
};

export default SkatersFeed;