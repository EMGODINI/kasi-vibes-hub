import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Video, Tag, Star } from 'lucide-react';

interface TrickVideoCreatorProps {
  onVideoCreated?: () => void;
}

const TrickVideoCreator: React.FC<TrickVideoCreatorProps> = ({ onVideoCreated }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [trickName, setTrickName] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !title.trim() || !videoUrl.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and video URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('trick_videos').insert({
        user_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        trick_name: trickName.trim() || null,
        difficulty: difficulty ? parseInt(difficulty) : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') || null,
      });

      if (error) throw error;

      toast({
        title: 'Trick Video Uploaded',
        description: 'Your trick video has been successfully added to the library.',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setTrickName('');
      setDifficulty('');
      setTags('');
      onVideoCreated?.();

    } catch (error: any) {
      console.error('Error uploading trick video:', error.message);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload trick video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-6">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-4">Upload New Trick Video</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kickflip Basics, My Best Grind"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="videoUrl" className="text-gray-300">Video URL <span className="text-red-500">*</span></Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="thumbnailUrl" className="text-gray-300">Thumbnail URL (Optional)</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="e.g., https://example.com/my-trick-thumbnail.jpg"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the trick or video..."
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 min-h-[80px] resize-none"
            />
          </div>
          <div>
            <Label htmlFor="trickName" className="text-gray-300">Trick Name (Optional)</Label>
            <Input
              id="trickName"
              type="text"
              value={trickName}
              onChange={(e) => setTrickName(e.target.value)}
              placeholder="e.g., Ollie, Kickflip, Heelflip"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="difficulty" className="text-gray-300">Difficulty (Optional)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full bg-gray-800 border-orange-500/50 text-white focus:border-orange-500">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
                <SelectItem value="1">1 - Beginner</SelectItem>
                <SelectItem value="2">2 - Easy</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - Hard</SelectItem>
                <SelectItem value="5">5 - Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tags" className="text-gray-300">Tags (Optional, comma-separated)</Label>
            <Input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., street, park, transition, grind, flip"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white"
          >
            {isLoading ? (
              'Uploading...' 
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Upload Video</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrickVideoCreator;


