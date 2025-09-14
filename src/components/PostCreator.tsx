import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Image, Send, X, Video, Link } from 'lucide-react';

interface PostCreatorProps {
  pageSlug?: string;
  onPostCreated?: () => void;
}

const PostCreator = ({ pageSlug, onPostCreated }: PostCreatorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
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
    if (!profile || (!content.trim() && !imageFile && !videoUrl.trim() && !externalLink.trim())) return;

    setIsLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `posts/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // Create post
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          content: content.trim(),
          image_url: imageUrl,
          video_url: videoUrl.trim() || null,
          external_link: externalLink.trim() || null,
          page_slug: pageSlug
        });

      if (error) throw error;

      // Reset form
      setContent('');
      setImageFile(null);
      setImagePreview(null);

      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      });

      // Notify parent component
      onPostCreated?.();

    } catch (error: any) {
      console.error('Post creation error:', error);
      toast({
        title: "Failed to create post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-orange-600 text-white">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's happening${pageSlug ? ` in ${pageSlug.replace('-', ' ')}` : ''}?`}
                className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">{content.length}/500 characters</p>
            </div>
          </div>

          {/* Media Previews */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-64 rounded-lg object-cover w-full"
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
          )}
          {videoUrl && (
            <div className="relative">
              <video controls src={videoUrl} className="max-h-64 rounded-lg object-cover w-full" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setVideoUrl('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="post-image-upload"
              />
              <label htmlFor="post-image-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                  asChild
                >
                  <span>
                    <Image className="w-4 h-4 mr-2" />
                    Photo
                  </span>
                </Button>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                onClick={() => {
                  const url = prompt("Enter video URL (YouTube, Vimeo, etc.):");
                  if (url) setVideoUrl(url);
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
                onClick={() => {
                  const url = prompt("Enter external link:");
                  if (url) setExternalLink(url);
                }}
              >
                <Link className="w-4 h-4 mr-2" />
                Link
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || (!content.trim() && !imageFile && !videoUrl.trim() && !externalLink.trim())}
              className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white"
            >
              {isLoading ? (
                'Posting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCreator;

