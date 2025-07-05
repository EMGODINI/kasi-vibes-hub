
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Plus, Heart, MessageSquare, Share, MoreVertical, LogOut } from 'lucide-react';
import Navigation from '@/components/Navigation';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import TrendingSection from '@/components/TrendingSection';
import ReelsGallery from '@/components/ReelsGallery';
import CommunityFeed from '@/components/CommunityFeed';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

interface Post {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  post_type: string;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  page_id: string;
}

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AppPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPagesAndPosts();
  }, []);

  const fetchPagesAndPosts = async () => {
    try {
      // Fetch active pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('app_pages')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (pagesError) throw pagesError;

      // Fetch recent posts from all pages
      const { data: postsData, error: postsError } = await supabase
        .from('page_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      setPages(pagesData || []);
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const PostCard = ({ post }: { post: Post }) => {
    const page = pages.find(p => p.id === post.page_id);
    
    return (
      <Card className="mb-6 hover:shadow-lg transition-all duration-300 border-0 enhanced-glass border border-orange-500/20 transform hover:scale-[1.01] spring-bounce">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-orange-500/50 spring-bounce hover:ring-orange-400">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {page?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm text-white">{page?.name || 'Unknown'}</p>
                  {post.is_featured && (
                    <Badge className="bg-orange-600 text-white text-xs animate-pulse">Featured</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white touch-target">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-white mb-2">{post.title}</h3>
          {post.content && (
            <p className="mb-3 text-sm text-gray-300">{post.content}</p>
          )}
          
          {post.image_url && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={post.image_url} 
                alt="Post content" 
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
                <Heart className="w-4 h-4 mr-1" />
                {post.likes_count}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
                <MessageSquare className="w-4 h-4 mr-1" />
                {post.comments_count}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PageCard = ({ page }: { page: AppPage }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 enhanced-glass border border-orange-500/20 transform hover:scale-[1.02] spring-bounce"
      onClick={() => navigate(`/page/${page.slug}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {page.icon_url ? (
            <img src={page.icon_url} alt={page.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
              {page.name[0]}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white">{page.title}</h3>
            {page.description && (
              <p className="text-sm text-gray-400">{page.description}</p>
            )}
          </div>
        </div>
        {page.thumbnail_url && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={page.thumbnail_url} 
              alt={page.name}
              className="w-full h-24 object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white font-montserrat">
                Awe {profile?.username || 'User'}! 👊🏾
              </h1>
              <p className="text-gray-400">Azi'She Khe - What's happening in your kasi today?</p>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-orange-500/50 spring-bounce hover:ring-orange-400">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {profile?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-400 hover:text-orange-500 touch-target"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Feed */}
          <div className="lg:col-span-2">
            {/* Pages Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Explore Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StaggeredList staggerDelay={100}>
                  {pages.map((page) => (
                    <PageCard key={page.id} page={page} />
                  ))}
                </StaggeredList>
              </div>
            </div>

            {/* Community Feed */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>Community Feed</span>
                <Badge className="bg-green-600 text-white">Live</Badge>
              </h2>
              <CommunityFeed 
                posts={posts} 
                pages={pages} 
                onPostUpdate={fetchPagesAndPosts}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trending Section */}
            <TrendingSection />
            
            {/* Reels Gallery */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <span>Reels</span>
                <Badge className="bg-purple-600 text-white">Hot</Badge>
              </h3>
              <ReelsGallery />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
