import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const ContentModeration = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
          is_featured
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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

  const toggleFeatured = async (postId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('page_posts')
        .update({ is_featured: !isFeatured })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Post ${!isFeatured ? 'featured' : 'unfeatured'} successfully`
      });
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
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

      toast({
        title: 'Success',
        description: 'Post deleted successfully'
      });
      fetchPosts();
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Content Moderation
        </CardTitle>
        <CardDescription>
          Review and moderate user-generated content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {posts.filter(p => p.is_featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured Posts</div>
            </div>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="flex items-start justify-between p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
              >
                <div className="flex space-x-3 flex-1">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{post.profiles?.username}</span>
                      <Badge variant="outline" className="text-xs">{post.post_type}</Badge>
                      {post.is_featured && (
                        <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1 text-sm">{post.title}</h4>
                    {post.content && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                    
                    {post.image_url && (
                      <div className="mb-2">
                        <img 
                          src={post.image_url} 
                          alt="Post content" 
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => toggleFeatured(post.id, post.is_featured)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {post.is_featured ? 'Unfeature' : 'Feature'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deletePost(post.id)}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentModeration;