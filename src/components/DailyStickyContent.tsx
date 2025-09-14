import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Lightbulb, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DailyContent {
  id: string;
  content_type: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  external_url?: string;
}

const DailyStickyContent: React.FC = () => {
  const [dailyContent, setDailyContent] = useState<DailyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    fetchDailyContent();
  }, []);

  const fetchDailyContent = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_content')
        .select('*')
        .eq('display_date', today)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDailyContent(data || []);
    } catch (error) {
      console.error('Error fetching daily content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'meme':
        return <Image className="h-5 w-5" />;
      case 'quote':
        return <Lightbulb className="h-5 w-5" />;
      case 'playlist':
        return <Volume2 className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'fun_fact':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getContentBadge = (type: string) => {
    const badges = {
      meme: { text: 'Daily Meme', color: 'bg-roll-up-neon-green text-black' },
      quote: { text: 'Quote of the Day', color: 'bg-roll-up-ultraviolet text-white' },
      playlist: { text: 'Chill Playlist', color: 'bg-roll-up-hazy-magenta text-white' },
      video: { text: 'Daily Reel', color: 'bg-roll-up-neon-green text-black' },
      fun_fact: { text: 'Cannabis Fact', color: 'bg-roll-up-deep-purple text-white' },
    };
    return badges[type as keyof typeof badges] || badges.fun_fact;
  };

  if (loading) {
    return (
      <div className="glass-tile rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-roll-up-deep-purple/20 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-roll-up-hazy-magenta/20 rounded"></div>
          <div className="h-4 bg-roll-up-ultraviolet/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
        Daily Sticky 🌿
      </h2>
      
      {dailyContent.length === 0 ? (
        <Card className="glass-tile animate-roll-up-glow">
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-3 text-roll-up-ultraviolet" />
            <p className="text-roll-up-hazy-magenta">No daily content yet! Check back later for fresh vibes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dailyContent.map((item) => {
            const badge = getContentBadge(item.content_type);
            
            return (
              <Card key={item.id} className="glass-tile hover:animate-roll-up-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getContentIcon(item.content_type)}
                      <CardTitle className="text-lg text-roll-up-ultraviolet">{item.title}</CardTitle>
                    </div>
                    <Badge className={badge.color}>{badge.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.content && (
                    <p className="text-roll-up-hazy-magenta mb-4 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                  
                  {item.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {item.video_url && (
                    <div className="mb-4 rounded-lg overflow-hidden aspect-video">
                      <iframe
                        src={item.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={item.title}
                      />
                    </div>
                  )}
                  
                  {item.external_url && (
                    <Button 
                      className="w-full bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80"
                      onClick={() => window.open(item.external_url, '_blank')}
                    >
                      {item.content_type === 'playlist' && (
                        <>{playingAudio ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}</>
                      )}
                      {item.content_type === 'playlist' ? 'Play Playlist' : 'Check it Out'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyStickyContent;