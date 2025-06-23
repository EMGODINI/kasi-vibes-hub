
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, UserPlus, Play, Pause } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Reel {
  id: string;
  user: string;
  username: string;
  avatar: string;
  video_url: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  is_following: boolean;
}

const ReelsContent = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  // Mock data for now
  useEffect(() => {
    const mockReels: Reel[] = [
      {
        id: '1',
        user: 'DanceKingKasi',
        username: '@dancekingkasi',
        avatar: '/placeholder.svg',
        video_url: '/sample-reel1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
        caption: 'New dance challenge! Can you keep up? 💃🕺 #KasiDance #Challenge',
        likes: 1250,
        comments: 89,
        shares: 45,
        is_following: false
      },
      {
        id: '2',
        user: 'CarStanceQueen',
        username: '@carstancequeen',
        avatar: '/placeholder.svg',
        video_url: '/sample-reel2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
        caption: 'Low and slow, just how we like it 🚗✨ #Stance #CarLife',
        likes: 890,
        comments: 34,
        shares: 28,
        is_following: true
      },
      {
        id: '3',
        user: 'BeatMakerPro',
        username: '@beatmakerpro',
        avatar: '/placeholder.svg',
        video_url: '/sample-reel3.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        caption: 'Creating fire beats in the studio 🔥🎵 #BeatMaking #Music',
        likes: 2100,
        comments: 156,
        shares: 78,
        is_following: false
      }
    ];
    setReels(mockReels);
  }, []);

  const handleLike = (reelId: string) => {
    setReels(prev => prev.map(reel => 
      reel.id === reelId 
        ? { ...reel, likes: reel.likes + 1 }
        : reel
    ));
  };

  const handleFollow = (reelId: string) => {
    setReels(prev => prev.map(reel => 
      reel.id === reelId 
        ? { ...reel, is_following: !reel.is_following }
        : reel
    ));
  };

  const togglePlay = (reelId: string) => {
    setCurrentPlaying(currentPlaying === reelId ? null : reelId);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Reels</h1>
          <p className="text-gray-400">Short videos from your community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map((reel) => (
            <Card key={reel.id} className="bg-gray-900 border-gray-800 overflow-hidden relative group">
              <div className="relative aspect-[9/16] bg-gray-800">
                {/* Video placeholder - would be actual video in production */}
                <img 
                  src={reel.thumbnail} 
                  alt="Reel thumbnail"
                  className="w-full h-full object-cover"
                />
                
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
                          <AvatarImage src={reel.avatar} />
                          <AvatarFallback className="bg-orange-600 text-white">
                            {reel.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold text-sm">{reel.user}</p>
                          <p className="text-gray-300 text-xs">{reel.username}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={reel.is_following ? "secondary" : "default"}
                          className={reel.is_following ? "bg-gray-600 hover:bg-gray-700" : "bg-orange-600 hover:bg-orange-700"}
                          onClick={() => handleFollow(reel.id)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          {reel.is_following ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                      <p className="text-white text-sm mb-3">{reel.caption}</p>
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
                    <span className="text-xs">{reel.likes}</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 flex flex-col items-center p-2"
                  >
                    <MessageCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs">{reel.comments}</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 flex flex-col items-center p-2"
                  >
                    <Share className="w-6 h-6 mb-1" />
                    <span className="text-xs">{reel.shares}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {reels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No reels available yet.</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Create Your First Reel
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
