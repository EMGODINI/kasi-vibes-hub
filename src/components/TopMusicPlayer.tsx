import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TopMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Fetch featured track from database
  const { data: featuredTrack } = useQuery({
    queryKey: ['featured-track'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Fallback to default if no featured track
  const currentTrack = featuredTrack || {
    title: 'Welcome to 3MGODINI',
    artist: 'Kasi Collective',
    cover_image_url: '/placeholder.svg'
  };

  return (
    <Card className="clean-card p-4 hover:soft-shadow transition-all duration-300">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-primary shadow-lg">
          <AvatarImage src={currentTrack.cover_image_url || '/placeholder.svg'} alt={currentTrack.artist} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
            3MG
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {currentTrack.artist}
          </p>
          
          {/* Animated Waveform */}
          <div className="flex items-center space-x-1 mt-2 h-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`
                  w-1 bg-gradient-to-t from-primary to-accent rounded-full
                  ${isPlaying ? 'animate-bounce' : 'h-1'}
                `}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  height: isPlaying ? `${Math.random() * 20 + 4}px` : '4px'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full w-12 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 text-white shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Now Playing Indicator */}
      <div className="mt-3 flex items-center justify-center">
        <span className="text-xs text-center text-primary animate-pulse-neon">
          🎵 Now Playing • Live from the Kasi
        </span>
      </div>
    </Card>
  );
};

export default TopMusicPlayer;