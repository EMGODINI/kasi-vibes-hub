import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Headphones } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  isPlaying: boolean;
}

const FloatingDJDeck = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    id: '1',
    title: 'Amapiano Vibes',
    artist: 'Kasi Squad',
    duration: '3:45',
    isPlaying: false
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setCurrentTrack(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  return (
    <>
      {/* Main DJ Deck - Mobile First */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 floating-dj-deck">
        <Card className={`
          kasi-glass mobile-card transition-all duration-500 ${
            isExpanded ? 'w-80 h-48' : 'w-16 h-16'
          } 
          animate-glow-breathe
        `}>
          
          {/* Collapsed View - Mini DJ Icon */}
          {!isExpanded && (
            <div className="w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="w-12 h-12 rounded-full kasi-button animate-bounce-taxi"
              >
                <Headphones className="w-6 h-6 text-primary animate-pulse-neon" />
              </Button>
            </div>
          )}

          {/* Expanded View - Full DJ Deck */}
          {isExpanded && (
            <div className="p-4 space-y-3">
              {/* Header with Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-primary animate-pulse-neon" />
                  <span className="text-sm font-semibold neon-text">3MGodini Radio</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground hover:text-primary"
                >
                  ×
                </Button>
              </div>

              {/* Track Info */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Audio Visualizer */}
              <div className="flex items-center justify-center space-x-1 h-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-1 bg-gradient-to-t from-primary to-accent rounded-full audio-wave
                      ${isPlaying ? 'animate-pulse-neon' : 'h-1'}
                    `}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isPlaying ? `${Math.random() * 16 + 4}px` : '4px'
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary touch-target"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handlePlayPause}
                  className={`
                    rounded-full w-10 h-10 kasi-button
                    ${isPlaying ? 'animate-party-pulse' : 'animate-glow-breathe'}
                  `}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary touch-target"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Volume2 className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${volume}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{volume}%</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Background ambient effect when playing */}
      {isPlaying && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse-neon" />
        </div>
      )}
    </>
  );
};

export default FloatingDJDeck;