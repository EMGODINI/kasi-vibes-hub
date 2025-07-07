import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

const TopMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack] = useState({
    title: 'Welcome to 3MGODINI',
    artist: 'Kasi Collective',
    avatar: '/placeholder.svg'
  });

  return (
    <Card className="kasi-glass p-4 animate-shimmer-gold">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage src={currentTrack.avatar} alt={currentTrack.artist} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
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
                  w-1 bg-gradient-to-t from-primary via-accent to-neon-gold rounded-full audio-wave
                  ${isPlaying ? 'animate-pulse-neon' : 'h-1'}
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
            className="rounded-full w-12 h-12 kasi-button"
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