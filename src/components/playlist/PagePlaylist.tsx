import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_image_url?: string;
  duration_seconds?: number;
  order_index: number;
}

interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  tracks: Track[];
}

interface PagePlaylistProps {
  pageSlug: string;
  className?: string;
}

export const PagePlaylist = ({ pageSlug, className = "" }: PagePlaylistProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, [pageSlug]);

  const fetchPlaylists = async () => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from('page_playlists')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('is_active', true)
        .order('order_index');

      if (playlistError) throw playlistError;

      if (playlistData?.length > 0) {
        const playlistsWithTracks = await Promise.all(
          playlistData.map(async (playlist) => {
            const { data: tracks, error: tracksError } = await supabase
              .from('playlist_tracks')
              .select('*')
              .eq('playlist_id', playlist.id)
              .eq('is_active', true)
              .order('order_index');

            if (tracksError) throw tracksError;

            return {
              ...playlist,
              tracks: tracks || []
            };
          })
        );

        setPlaylists(playlistsWithTracks);
        if (playlistsWithTracks.length > 0) {
          setCurrentPlaylist(playlistsWithTracks[0]);
          if (playlistsWithTracks[0].tracks.length > 0) {
            setCurrentTrack(playlistsWithTracks[0].tracks[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    }
  };

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      setCurrentTrack(track);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (currentPlaylist && currentTrack) {
      const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
      playTrack(currentPlaylist.tracks[nextIndex]);
    }
  };

  const previousTrack = () => {
    if (currentPlaylist && currentTrack) {
      const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      const previousIndex = currentIndex === 0 ? currentPlaylist.tracks.length - 1 : currentIndex - 1;
      playTrack(currentPlaylist.tracks[previousIndex]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentPlaylist || currentPlaylist.tracks.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            {currentPlaylist.cover_image_url && (
              <img 
                src={currentPlaylist.cover_image_url} 
                alt={currentPlaylist.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-xl text-foreground">{currentPlaylist.title}</CardTitle>
              {currentPlaylist.description && (
                <p className="text-muted-foreground">{currentPlaylist.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Track Display */}
          {currentTrack && (
            <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg">
              {currentTrack.cover_image_url && (
                <img 
                  src={currentTrack.cover_image_url} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{currentTrack.title}</h4>
                <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
              </div>
            </div>
          )}

          {/* Player Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              className="text-primary hover:text-primary/80"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              className="text-primary hover:text-primary/80"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentPlaylist.tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                  currentTrack?.id === track.id 
                    ? 'bg-primary/20 text-primary' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{track.title}</p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
                {track.duration_seconds && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(track.duration_seconds)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={nextTrack}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </CardContent>
      </Card>
    </div>
  );
};