import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Image } from 'lucide-react';

interface ForumTopicCreatorProps {
  forumId: string;
  onTopicCreated?: () => void;
}

const ForumTopicCreator = ({ forumId, onTopicCreated }: ForumTopicCreatorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.title.trim()) return;

    setIsLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `forum_topics/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('forum-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('forum-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('forum_topics')
        .insert({
          forum_id: forumId,
          user_id: profile.id,
          title: formData.title.trim(),
          content: formData.content.trim() || null,
          image_url: imageUrl
        });

      if (error) throw error;

      setFormData({
        title: '',
        content: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setIsOpen(false);

      toast({
        title: "Topic created!",
        description: "Your forum topic has been posted.",
      });

      onTopicCreated?.();

    } catch (error: any) {
      console.error('Forum topic creation error:', error);
      toast({
        title: "Failed to create topic",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Topic
      </Button>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-blue-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-montserrat flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-400" />
            Create New Forum Topic
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Topic Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-gray-800 border-blue-500/50 text-white placeholder:text-gray-400 focus:border-blue-400"
              placeholder="e.g., Best strains for creativity"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-white">
              Content
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="bg-gray-800 border-blue-500/50 text-white placeholder:text-gray-400 focus:border-blue-400 min-h-[80px]"
              placeholder="Share your thoughts, questions, or experiences..."
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg object-cover w-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="topic-image-upload"
                />
                <label htmlFor="topic-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Image className="w-4 h-4 mr-2" />
                      Add Image
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.title.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold"
          >
            {isLoading ? 'Posting Topic...' : 'Post Topic'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForumTopicCreator;

