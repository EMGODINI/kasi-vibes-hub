
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, UserPlus, Play, Pause } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Reel {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
}

const ReelsContent = () => {
  const { user } = useAuth();
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching reels:', error);
        return [];
      }

      return data || [];
    }
  });

  const handleLike = async (reelId: string) => {
    if (!user) return;
    
    try {
      // Get current likes count first, then increment
      const { data: currentReel } = await supabase
        .from('reels')
        .select('likes_count')
        .eq('id', reelId)
        .single();
        
      if (currentReel) {
        await supabase
          .from('reels')
          .update({ likes_count: currentReel.likes_count + 1 })
          .eq('id', reelId);
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;
    
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', userId)
        .single();

      if (existingFollow) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', userId);
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            followed_id: userId
          });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const togglePlay = (reelId: string) => {
    setCurrentPlaying(currentPlaying === reelId ? null : reelId);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">KASI FLIX</h1>
          <p className="text-gray-400">Share your dance moves & movie clips - 15 seconds max</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-800 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reels.map((reel) => (
              <Card key={reel.id} className="bg-gray-900 border-gray-800 overflow-hidden relative group">
                <div className="relative aspect-[9/16] bg-gray-800">
                  {/* Video thumbnail */}
                  {reel.thumbnail_url ? (
                    <img 
                      src={reel.thumbnail_url} 
                      alt="Reel thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-lg font-bold">{reel.title}</h3>
                      </div>
                    </div>
                  )}
                  
                  {/* Play/Pause overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => togglePlay(reel.id)}
                    >
                      {currentPlaying === reel.id ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8" />
                      )}
                    </Button>
                  </div>

                  {/* User info overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="w-10 h-10 ring-2 ring-white/20">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-orange-600 text-white">
                              {reel.title[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-semibold text-sm">Creator</p>
                            <p className="text-gray-300 text-xs">{new Date(reel.created_at).toLocaleDateString()}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleFollow(reel.user_id)}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Follow
                          </Button>
                        </div>
                        <p className="text-white text-sm mb-3">{reel.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute right-4 bottom-4 flex flex-col space-y-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 flex flex-col items-center p-2"
                      onClick={() => handleLike(reel.id)}
                    >
                      <Heart className="w-6 h-6 mb-1" />
                      <span className="text-xs">{reel.likes_count}</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 flex flex-col items-center p-2"
                    >
                      <MessageCircle className="w-6 h-6 mb-1" />
                      <span className="text-xs">{reel.comments_count}</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 flex flex-col items-center p-2"
                    >
                      <Share className="w-6 h-6 mb-1" />
                      <span className="text-xs">{reel.shares_count}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && reels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No videos available yet.</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Upload Your First Dance or Movie Clip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Reels = () => {
  return (
    <ProtectedRoute>
      <ReelsContent />
    </ProtectedRoute>
  );
};

export default Reels;
