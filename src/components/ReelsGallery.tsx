import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, Heart, MessageCircle, Share, MoreVertical, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReelPost {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  page_id: string;
}

interface ReelCardProps {
  reel: ReelPost;
  isActive: boolean;
  onPlay: () => void;
}

const ReelCard = ({ reel, isActive, onPlay }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        onPlay();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Here you could update the like count in the database
  };

  return (
    <Card className="relative w-full max-w-sm mx-auto aspect-[9/16] overflow-hidden border-0 shadow-2xl">
      <div className="relative w-full h-full bg-black">
        {/* Video/Image Content */}
        {reel.post_type === 'video' && reel.image_url ? (
          <video
            ref={videoRef}
            src={reel.image_url}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
            style={reel.image_url ? {
              backgroundImage: `url(${reel.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            {!reel.image_url && (
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{reel.title}</h3>
                <p className="text-sm opacity-80">{reel.content}</p>
              </div>
            )}
          </div>
        )}

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-white/50">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-orange-500 text-white">
                {reel.title[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm">{reel.title}</p>
              <p className="text-white/80 text-xs">
                {new Date(reel.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Side Actions */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`w-12 h-12 rounded-full ${
              isLiked ? 'text-red-500' : 'text-white'
            } hover:bg-white/20 flex flex-col items-center justify-center`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs mt-1">{reel.likes_count + (isLiked ? 1 : 0)}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full text-white hover:bg-white/20 flex flex-col items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">{reel.comments_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full text-white hover:bg-white/20 flex flex-col items-center justify-center"
          >
            <Share className="w-6 h-6" />
          </Button>

          {reel.post_type === 'video' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="w-12 h-12 rounded-full text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>
          )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-4 left-4 right-16">
          <h3 className="text-white font-semibold text-lg mb-1">{reel.title}</h3>
          {reel.content && (
            <p className="text-white/90 text-sm line-clamp-2">{reel.content}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const ReelsGallery = () => {
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [activeReel, setActiveReel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('page_posts')
        .select('*')
        .in('post_type', ['video', 'photo', 'music'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto aspect-[9/16] bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading reels...</div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <Card className="w-full max-w-sm mx-auto aspect-[9/16] bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reels available</p>
            <p className="text-sm mt-2">Upload videos and photos to see them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <ReelCard
          reel={reels[activeReel]}
          isActive={true}
          onPlay={() => {}}
        />
      </div>
      
      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2">
        {reels.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveReel(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeReel ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelsGallery;