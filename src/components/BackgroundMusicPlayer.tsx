import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BackgroundMusicPlayerProps {
  onPlayingChange?: (playing: boolean) => void;
}

const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({ onPlayingChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30); // Low volume by default
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch real tracks from database
  const { data: lofiTracks = [] } = useQuery({
    queryKey: ['background-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('Error fetching background tracks:', error);
        return [];
      }

      return data?.map(track => ({
        title: track.title,
        url: track.audio_url || '',
      })) || [];
    }
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackEnd = () => {
    const nextTrack = (currentTrack + 1) % lofiTracks.length;
    setCurrentTrack(nextTrack);
    // Auto-play next track if currently playing
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Card className="glass-tile p-4 min-w-[280px]">
        <div className="flex items-center gap-3 mb-3">
          <Music className="h-5 w-5 text-roll-up-ultraviolet" />
          <div className="flex-1">
            <p className="text-sm font-medium text-roll-up-ultraviolet">
              Chill Vibes
            </p>
            <p className="text-xs text-roll-up-hazy-magenta">
              {lofiTracks[currentTrack]?.title || "No track"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={togglePlay}
            className="bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-roll-up-hazy-magenta" />
            ) : (
              <Volume2 className="h-4 w-4 text-roll-up-hazy-magenta" />
            )}
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-roll-up-hazy-magenta w-8">
              {volume}%
            </span>
          </div>
        </div>
        
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={lofiTracks[currentTrack]?.url}
          onEnded={handleTrackEnd}
          loop={false}
        />
      </Card>
    </div>
  );
};

export default BackgroundMusicPlayer;