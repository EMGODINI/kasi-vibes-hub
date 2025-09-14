
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import PostCreationModal from '@/components/PostCreationModal';
import SocialActions from '@/components/SocialActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
}

interface PagePost {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  post_type: string;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  shared_count: number;
  created_at: string;
  created_by?: string;
}

const DynamicPageContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState<AppPage | null>(null);
  const [posts, setPosts] = useState<PagePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  const fetchPageData = async () => {
    try {
      console.log('Fetching page data for slug:', slug);
      
      // Fetch page info
      const { data: pageData, error: pageError } = await supabase
        .from('app_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (pageError) {
        console.error('Page error:', pageError);
        throw pageError;
      }
      
      console.log('Page data:', pageData);
      setPage(pageData);

      // Fetch posts for this page
      const { data: postsData, error: postsError } = await supabase
        .from('page_posts')
        .select('*')
        .eq('page_id', pageData.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Posts error:', postsError);
        throw postsError;
      }
      
      console.log('Posts data:', postsData);
      setPosts(postsData || []);

    } catch (error) {
      console.error('Error fetching page data:', error);
      toast({
        title: "Error",
        description: "Failed to load page",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPageData(); // Refresh posts after creating a new one
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <p>Loading...</p>
      </div>
    </div>;
  }

  if (!page) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <p>Page not found</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {page.icon_url && (
                <img src={page.icon_url} alt={page.name} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <h1 className="text-3xl font-bold">{page.title}</h1>
                {page.description && (
                  <p className="text-muted-foreground">{page.description}</p>
                )}
              </div>
            </div>
            
            {/* Create Post Button */}
            {user && (
              <Button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>
          
          {page.thumbnail_url && (
            <div className="mb-6">
              <img 
                src={page.thumbnail_url} 
                alt={page.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet in this category.</p>
                {user && (
                  <Button
                    onClick={() => setIsPostModalOpen(true)}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Be the first to post!
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-white/50 backdrop-blur-sm border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{post.post_type}</Badge>
                      {post.is_featured && (
                        <Badge className="bg-orange-500">Featured</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.content && (
                    <p className="text-muted-foreground mb-4">{post.content}</p>
                  )}
                  
                  {post.image_url && (
                    <div className="mb-4">
                      <img 
                        src={post.image_url} 
                        alt="Post content"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                   
                   <SocialActions
                     postId={post.id}
                     likesCount={post.likes_count}
                     commentsCount={post.comments_count}
                     sharedCount={post.shared_count || 0}
                     authorId={post.created_by}
                     onLikeUpdate={(newCount) => {
                       const updatedPosts = posts.map(p => 
                         p.id === post.id ? { ...p, likes_count: newCount } : p
                       );
                       setPosts(updatedPosts);
                     }}
                     onShareUpdate={(newCount) => {
                       const updatedPosts = posts.map(p => 
                         p.id === post.id ? { ...p, shared_count: newCount } : p
                       );
                       setPosts(updatedPosts);
                     }}
                   />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Post Creation Modal */}
      {page && (
        <PostCreationModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          pageId={page.id}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

const DynamicPage = () => {
  return (
    <ProtectedRoute>
      <DynamicPageContent />
    </ProtectedRoute>
  );
};

export default DynamicPage;
