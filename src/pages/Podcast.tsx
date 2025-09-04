
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Radio, Upload, Play, Pause, Heart, MessageSquare } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AudioPlayer from '@/components/AudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const Podcast = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [userCredits] = useState(5); // Mock user credits - could be fetched from user profile
  const [showUploadForm, setShowUploadForm] = useState(false);

  const { data: podcasts = [], isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcasts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching podcasts:', error);
        throw error;
      }

      return data || [];
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle podcast upload logic here
    console.log('Uploading podcast...');
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-montserrat flex items-center">
                <Radio className="w-8 h-8 mr-3 text-orange-500" />
                Podcast Hub
              </h1>
              <p className="text-gray-400">Real stories, real voices from the kasi</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Credits</p>
              <Badge className="bg-orange-600 text-white">{userCredits} Credits</Badge>
            </div>
          </div>

          {/* Upload Section */}
          {!showUploadForm ? (
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your Podcast
            </Button>
          ) : (
            <Card className="bg-gray-900/50 border border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload New Podcast</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input 
                      id="title"
                      placeholder="Enter podcast title"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your podcast..."
                      className="bg-gray-800 border-orange-500/50 text-white"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="audio" className="text-white">Audio File</Label>
                    <Input 
                      id="audio"
                      type="file"
                      accept="audio/*"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Upload
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setShowUploadForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Podcast List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border border-orange-500/20 backdrop-blur-sm animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            podcasts.map((podcast) => (
              <Card key={podcast.id} className="bg-gray-900/50 border border-orange-500/20 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={podcast.thumbnail_url || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400'}
                      alt={podcast.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">{podcast.title}</h3>
                            {podcast.is_premium && (
                              <Badge className="bg-orange-600 text-white text-xs">Premium</Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">by {podcast.host_name}</p>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {podcast.duration_seconds ? 
                            `${Math.floor(podcast.duration_seconds / 60)}:${(podcast.duration_seconds % 60).toString().padStart(2, '0')}` : 
                            'N/A'
                          }
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{podcast.description}</p>
                      
                      {podcast.is_premium && userCredits < 1 ? (
                        <div className="bg-gray-800 rounded-lg p-4 border border-orange-500/30">
                          <p className="text-orange-400 text-sm mb-2">Premium content - requires credits</p>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            Buy Credits
                          </Button>
                        </div>
                      ) : (
                        <AudioPlayer 
                          audioUrl={podcast.audio_url}
                          title={podcast.title}
                          isPlaying={isPlaying === podcast.id}
                          onPlayPause={() => setIsPlaying(isPlaying === podcast.id ? null : podcast.id)}
                        />
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{podcast.plays_count} plays</span>
                          <span>{podcast.likes_count} likes</span>
                          <span>{podcast.comments_count} comments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {!isLoading && podcasts.length === 0 && (
            <div className="text-center py-12">
              <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">No podcasts available yet.</p>
              <Button 
                onClick={() => setShowUploadForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Upload the first podcast
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
