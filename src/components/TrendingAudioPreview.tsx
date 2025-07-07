import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';

interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  avatar: string;
  likes: number;
  comments: number;
  isPlaying: boolean;
}

const TrendingAudioPreview = () => {
  const [tracks] = useState<TrendingTrack[]>([
    {
      id: '1',
      title: 'Amapiano Fire Mix',
      artist: 'DJ Maphorisa',
      avatar: '/placeholder.svg',
      likes: 2340,
      comments: 156,
      isPlaying: false
    },
    {
      id: '2',
      title: 'Kasi Vibes Only',
      artist: 'Focalistic',
      avatar: '/placeholder.svg',
      likes: 1876,
      comments: 89,
      isPlaying: false
    },
    {
      id: '3',
      title: 'Sunday Chills',
      artist: 'Kabza De Small',
      avatar: '/placeholder.svg',
      likes: 3210,
      comments: 234,
      isPlaying: false
    }
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold neon-text font-montserrat">🔥 Trending Now</h2>
      <div className="grid grid-cols-1 gap-3">
        {tracks.map((track) => (
          <Card key={track.id} className="kasi-glass mobile-card p-4 hover:animate-glow-breathe transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary/50">
                  <AvatarImage src={track.avatar} alt={track.artist} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {track.artist[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full kasi-button animate-pulse-neon"
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-sm">
                  {track.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  by {track.artist}
                </p>
                
                {/* Audio Waveform */}
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-primary to-accent rounded-full audio-wave"
                      style={{
                        height: `${Math.random() * 12 + 4}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col items-center space-y-2">
                <Button variant="ghost" size="sm" className="touch-target text-muted-foreground hover:text-primary">
                  <Heart className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{track.likes}</span>
                
                <Button variant="ghost" size="sm" className="touch-target text-muted-foreground hover:text-primary">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{track.comments}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingAudioPreview;