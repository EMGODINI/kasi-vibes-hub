import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Share, Plus, Volume2, VolumeX, Leaf } from 'lucide-react';
import Navigation from '@/components/Navigation';
import PostCreationModal from '@/components/PostCreationModal';
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
  audio_url?: string;
  audio_title?: string;
  auto_play_audio: boolean;
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
  created_at: string;
}

const AzisheNgamaContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [page, setPage] = useState<AppPage | null>(null);
  const [posts, setPosts] = useState<PagePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      // Fetch page info for Azishe Ngama 2
      const { data: pageData, error: pageError } = await supabase
        .from('app_pages')
        .select('*')
        .eq('slug', 'azishe-ngama-2')
        .eq('is_active', true)
        .single();

      if (pageError) throw pageError;
      setPage(pageData);

      // Auto-play audio if available
      if (pageData.audio_url && pageData.auto_play_audio) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              console.log('Auto-play blocked by browser');
            });
          }
        }, 1000);
      }

      // Fetch posts for this page
      const { data: postsData, error: postsError } = await supabase
        .from('page_posts')
        .select('*')
        .eq('page_id', pageData.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
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
    fetchPageData();
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <p className="text-white">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black">
      <Navigation />
      
      {/* Audio Player */}
      {page.audio_url && (
        <audio
          ref={audioRef}
          src={page.audio_url}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Page Header with Cannabis Theme */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Leaf className="w-8 h-8 text-green-400 animate-pulse" />
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                {page.title}
              </h1>
              <Leaf className="w-8 h-8 text-green-400 animate-pulse" />
            </div>
            
            {/* Main Caption */}
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 mb-6">
              <p className="text-2xl text-green-300 font-bold drop-shadow-md">
                Awe Mbemi you know the Rules 
              </p>
              <p className="text-xl text-green-400 font-semibold mt-2">
                puff puff pass 💨
              </p>
            </div>

            {page.description && (
              <p className="text-green-200 mb-4">{page.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Audio Controls */}
              {page.audio_url && (
                <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-500/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAudio}
                    className="text-green-300 hover:text-green-200"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-green-300 hover:text-green-200"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <span className="text-green-300 text-sm">
                    {page.audio_title || 'Track'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Create Post Button */}
            {user && (
              <Button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share Your Vibe
              </Button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="bg-green-900/30 backdrop-blur-sm border border-green-500/30">
              <CardContent className="py-12 text-center">
                <Leaf className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-200 mb-4">No posts yet in this sacred space.</p>
                {user && (
                  <Button
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Be the first to share!
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-green-900/20 backdrop-blur-sm border border-green-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{post.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-500 text-green-300">
                        {post.post_type}
                      </Badge>
                      {post.is_featured && (
                        <Badge className="bg-green-500 text-white">Featured</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.content && (
                    <p className="text-green-100 mb-4">{post.content}</p>
                  )}
                  
                  {post.image_url && (
                    <div className="mb-4">
                      <img 
                        src={post.image_url} 
                        alt="Post content"
                        className="w-full h-64 object-cover rounded-lg border border-green-500/20"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-green-500/20">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-green-300 hover:text-green-200">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-300 hover:text-green-200">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.comments_count}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-green-300 hover:text-green-200">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
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

const AzisheNgama = () => {
  return (
    <ProtectedRoute>
      <AzisheNgamaContent />
    </ProtectedRoute>
  );
};

export default AzisheNgama;