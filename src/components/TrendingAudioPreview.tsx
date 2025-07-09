import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useGuestLimit } from '@/hooks/useGuestLimit';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import GuestLimitModal from './GuestLimitModal';

const TrendingAudioPreview = () => {
  const { trackPostView, showLimitModal, setShowLimitModal, isLimitReached } = useGuestLimit();
  
  // Fetch trending tracks from database
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['trending-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .eq('is_trending', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground font-inter">🔥 Trending Now</h2>
        <div className="text-center py-8 text-muted-foreground">Loading trending tracks...</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground font-inter">🔥 Trending Now</h2>
        <div className="text-center py-8 text-muted-foreground">No trending tracks available yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground font-inter">🔥 Trending Now</h2>
      <div className="grid grid-cols-1 gap-3">
        {tracks.map((track) => (
          <Card key={track.id} className="clean-card p-4 hover:soft-shadow transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary/50">
                  <AvatarImage src={track.cover_image_url || '/placeholder.svg'} alt={track.artist} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {track.artist[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md hover:opacity-90 transition-all duration-300"
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
                <span className="text-xs text-muted-foreground">{track.likes_count}</span>
                
                <Button variant="ghost" size="sm" className="touch-target text-muted-foreground hover:text-primary">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{track.comments_count}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingAudioPreview;