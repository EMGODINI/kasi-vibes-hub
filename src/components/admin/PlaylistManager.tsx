import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Upload, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_image_url?: string;
  duration_seconds?: number;
  order_index: number;
  is_active: boolean;
}

interface Playlist {
  id: string;
  page_slug: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  tracks?: Track[];
}

export const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistForm, setPlaylistForm] = useState({
    page_slug: '',
    title: '',
    description: '',
    cover_image_url: ''
  });
  const [trackForm, setTrackForm] = useState({
    title: '',
    artist: '',
    audio_url: '',
    cover_image_url: '',
    duration_seconds: 0
  });
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [showTrackDialog, setShowTrackDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchTracks(selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('page_playlists')
        .select('*')
        .order('page_slug', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    }
  };

  const fetchTracks = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive"
      });
    }
  };

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (editingPlaylist) {
        const { error } = await supabase
          .from('page_playlists')
          .update({
            ...playlistForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlaylist.id);

        if (error) throw error;
        toast({ title: "Success", description: "Playlist updated successfully" });
      } else {
        const { error } = await supabase
          .from('page_playlists')
          .insert({
            ...playlistForm,
            created_by: user.id,
            order_index: playlists.length
          });

        if (error) throw error;
        toast({ title: "Success", description: "Playlist created successfully" });
      }

      setPlaylistForm({ page_slug: '', title: '', description: '', cover_image_url: '' });
      setEditingPlaylist(null);
      setShowPlaylistDialog(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast({
        title: "Error",
        description: "Failed to save playlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlaylist) return;

    setIsLoading(true);
    try {
      if (editingTrack) {
        const { error } = await supabase
          .from('playlist_tracks')
          .update({
            ...trackForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTrack.id);

        if (error) throw error;
        toast({ title: "Success", description: "Track updated successfully" });
      } else {
        const { error } = await supabase
          .from('playlist_tracks')
          .insert({
            ...trackForm,
            playlist_id: selectedPlaylist.id,
            created_by: user.id,
            order_index: tracks.length
          });

        if (error) throw error;
        toast({ title: "Success", description: "Track added successfully" });
      }

      setTrackForm({ title: '', artist: '', audio_url: '', cover_image_url: '', duration_seconds: 0 });
      setEditingTrack(null);
      setShowTrackDialog(false);
      fetchTracks(selectedPlaylist.id);
    } catch (error) {
      console.error('Error saving track:', error);
      toast({
        title: "Error",
        description: "Failed to save track",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (playlist: Playlist) => {
    if (!confirm(`Are you sure you want to delete "${playlist.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('page_playlists')
        .delete()
        .eq('id', playlist.id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Playlist deleted successfully" });
      fetchPlaylists();
      if (selectedPlaylist?.id === playlist.id) {
        setSelectedPlaylist(null);
        setTracks([]);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive"
      });
    }
  };

  const deleteTrack = async (track: Track) => {
    if (!confirm(`Are you sure you want to delete "${track.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('id', track.id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Track deleted successfully" });
      if (selectedPlaylist) {
        fetchTracks(selectedPlaylist.id);
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Error",
        description: "Failed to delete track",
        variant: "destructive"
      });
    }
  };

  const editPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistForm({
      page_slug: playlist.page_slug,
      title: playlist.title,
      description: playlist.description || '',
      cover_image_url: playlist.cover_image_url || ''
    });
    setShowPlaylistDialog(true);
  };

  const editTrack = (track: Track) => {
    setEditingTrack(track);
    setTrackForm({
      title: track.title,
      artist: track.artist,
      audio_url: track.audio_url,
      cover_image_url: track.cover_image_url || '',
      duration_seconds: track.duration_seconds || 0
    });
    setShowTrackDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Playlist Manager</h2>
        <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPlaylist(null);
                setPlaylistForm({ page_slug: '', title: '', description: '', cover_image_url: '' });
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePlaylistSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page_slug">Page</Label>
                <Select 
                  value={playlistForm.page_slug} 
                  onValueChange={(value) => setPlaylistForm({...playlistForm, page_slug: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skaters-street">Skaters Street</SelectItem>
                    <SelectItem value="stance">Stance (Weed Page)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={playlistForm.title}
                  onChange={(e) => setPlaylistForm({...playlistForm, title: e.target.value})}
                  placeholder="Playlist title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={playlistForm.description}
                  onChange={(e) => setPlaylistForm({...playlistForm, description: e.target.value})}
                  placeholder="Playlist description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  value={playlistForm.cover_image_url}
                  onChange={(e) => setPlaylistForm({...playlistForm, cover_image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Saving...' : editingPlaylist ? 'Update Playlist' : 'Create Playlist'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playlists List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              Playlists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPlaylist?.id === playlist.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{playlist.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {playlist.page_slug.replace('-', ' ')}
                      </p>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          editPlaylist(playlist);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracks List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedPlaylist ? `Tracks - ${selectedPlaylist.title}` : 'Select a Playlist'}
              </span>
              {selectedPlaylist && (
                <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingTrack(null);
                        setTrackForm({ title: '', artist: '', audio_url: '', cover_image_url: '', duration_seconds: 0 });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Track
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTrack ? 'Edit Track' : 'Add New Track'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTrackSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="track_title">Title</Label>
                        <Input
                          id="track_title"
                          value={trackForm.title}
                          onChange={(e) => setTrackForm({...trackForm, title: e.target.value})}
                          placeholder="Track title"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="artist">Artist</Label>
                        <Input
                          id="artist"
                          value={trackForm.artist}
                          onChange={(e) => setTrackForm({...trackForm, artist: e.target.value})}
                          placeholder="Artist name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="audio_url">Audio URL</Label>
                        <Input
                          id="audio_url"
                          value={trackForm.audio_url}
                          onChange={(e) => setTrackForm({...trackForm, audio_url: e.target.value})}
                          placeholder="https://example.com/audio.mp3"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="track_cover_image_url">Cover Image URL</Label>
                        <Input
                          id="track_cover_image_url"
                          value={trackForm.cover_image_url}
                          onChange={(e) => setTrackForm({...trackForm, cover_image_url: e.target.value})}
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                        <Input
                          id="duration_seconds"
                          type="number"
                          value={trackForm.duration_seconds}
                          onChange={(e) => setTrackForm({...trackForm, duration_seconds: parseInt(e.target.value) || 0})}
                          placeholder="180"
                        />
                      </div>
                      
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Saving...' : editingTrack ? 'Update Track' : 'Add Track'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlaylist ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="p-3 bg-muted rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                          <div>
                            <h5 className="font-medium text-foreground">{track.title}</h5>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editTrack(track)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTrack(track)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {tracks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No tracks added yet. Click "Add Track" to get started.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a playlist to manage its tracks.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};