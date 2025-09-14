import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [welcomeTrack, setWelcomeTrack] = useState('welcome-track.mp3');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTrackUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      toast({
        title: "Track uploaded successfully!",
        description: "New welcome track is now active for first-time users.",
      });
      setIsUploading(false);
    }, 2000);
  };

  const handleContentModeration = () => {
    console.log('Configure content moderation');
    // TODO: Implement content moderation configuration
  };

  const handleUploadLimits = () => {
    console.log('Manage upload limits');
    // TODO: Implement upload limits management
  };

  return (
    <div className="space-y-6">
      <Card className="clean-card">
        <CardHeader>
          <CardTitle>Welcome Track Management</CardTitle>
          <CardDescription>Upload and manage the welcome track for new users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackUpload} className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg">
              <Music className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Current Welcome Track</p>
                <p className="text-sm text-muted-foreground">{welcomeTrack}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="track-upload">Upload New Welcome Track</Label>
              <Input
                id="track-upload"
                type="file"
                accept="audio/*"
                className="input-clean"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isUploading}
              variant="gradient"
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Update Welcome Track'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="clean-card">
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
            <div>
              <p className="font-medium">Content Moderation</p>
              <p className="text-sm text-muted-foreground">Auto-approve posts from trusted users</p>
            </div>
            <Button variant="outline" onClick={handleContentModeration}>
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
            <div>
              <p className="font-medium">Upload Limits</p>
              <p className="text-sm text-muted-foreground">Set file size and type restrictions</p>
            </div>
            <Button variant="outline" onClick={handleUploadLimits}>
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;