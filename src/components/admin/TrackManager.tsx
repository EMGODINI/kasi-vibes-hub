import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, Trash2, Eye, EyeOff, Music, Play, Pause, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TrackManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    is_trending: false,
    is_featured: false
  });

  // Fetch existing tracks
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['admin-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (50MB limit for audio)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim() || !formData.artist.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter both title and artist.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `tracks/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Save track record to database
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title: formData.title,
          artist: formData.artist,
          description: formData.description,
          audio_url: publicUrl,
          is_trending: formData.is_trending,
          is_featured: formData.is_featured,
          created_by: user.id
        });

      if (dbError) throw dbError;

      // Reset form
      setFormData({ title: '', artist: '', description: '', is_trending: false, is_featured: false });
      (e.target as HTMLInputElement).value = '';
      
      // Refresh tracks list
      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });

      toast({
        title: "Track uploaded successfully!",
        description: "The track is now available in the app.",
      });
    } catch (error: any) {
      console.error('Track upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverImageUpload = async (trackId: string, file: File) => {
    try {
      // Upload cover image
      const fileExt = file.name.split('.').pop();
      const fileName = `covers/${trackId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Update track with cover image
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ cover_image_url: publicUrl })
        .eq('id', trackId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
      
      toast({
        title: "Cover image updated",
        description: "Track cover image has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleTrackStatus = async (trackId: string, field: 'is_active' | 'is_trending' | 'is_featured', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ [field]: !currentValue })
        .eq('id', trackId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
      
      toast({
        title: "Track updated",
        description: `Track ${field.replace('is_', '')} ${!currentValue ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTrack = async (trackId: string, audioUrl?: string, coverUrl?: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      if (dbError) throw dbError;

      // Delete files from storage
      const filesToDelete = [];
      if (audioUrl) {
        const audioPath = audioUrl.split('/content/')[1];
        if (audioPath) filesToDelete.push(audioPath);
      }
      if (coverUrl) {
        const coverPath = coverUrl.split('/content/')[1];
        if (coverPath) filesToDelete.push(coverPath);
      }

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('content')
          .remove(filesToDelete);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
      
      toast({
        title: "Track deleted",
        description: "Track has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="clean-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Upload Track
          </CardTitle>
          <CardDescription>Add new tracks to your 3MGODINI platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter track title"
                className="input-clean"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist Name</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Enter artist name"
                className="input-clean"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter track description"
              className="input-clean"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="trending"
                checked={formData.is_trending}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_trending: checked }))}
              />
              <Label htmlFor="trending">Mark as Trending</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="featured">Mark as Featured</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audio-upload">Upload Audio File</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              disabled={isUploading}
              className="input-clean"
            />
          </div>
          
          {isUploading && (
            <div className="flex items-center space-x-2 text-primary">
              <Upload className="w-4 h-4 animate-pulse" />
              <span>Uploading track...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracks List */}
      <Card className="clean-card">
        <CardHeader>
          <CardTitle>Manage Tracks</CardTitle>
          <CardDescription>Control your platform's music content</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading tracks...</div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tracks uploaded yet. Upload your first track above.
            </div>
          ) : (
            <div className="space-y-4">
              {tracks.map((track) => (
                <div key={track.id} className="border rounded-lg p-4 bg-white/70 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{track.title}</h3>
                        {track.is_trending && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {track.is_featured && <Star className="w-4 h-4 text-purple-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground">by {track.artist}</p>
                      {track.description && (
                        <p className="text-xs text-muted-foreground mt-1">{track.description}</p>
                      )}
                    </div>
                    {track.cover_image_url && (
                      <img
                        src={track.cover_image_url}
                        alt={`${track.title} cover`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTrackStatus(track.id, 'is_active', track.is_active)}
                        className={track.is_active ? "text-green-600" : "text-gray-500"}
                      >
                        {track.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {track.is_active ? 'Active' : 'Inactive'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTrackStatus(track.id, 'is_trending', track.is_trending)}
                        className={track.is_trending ? "text-yellow-600" : "text-gray-500"}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Trending
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTrackStatus(track.id, 'is_featured', track.is_featured)}
                        className={track.is_featured ? "text-purple-600" : "text-gray-500"}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverImageUpload(track.id, file);
                        }}
                        className="hidden"
                        id={`cover-${track.id}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById(`cover-${track.id}`)?.click()}
                      >
                        Cover
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTrack(track.id, track.audio_url, track.cover_image_url)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackManager;