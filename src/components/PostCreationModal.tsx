
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  onPostCreated?: () => void;
}

const PostCreationModal = ({ isOpen, onClose, pageId, onPostCreated }: PostCreationModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'general',
    is_featured: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('page-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create posts",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title for your post",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
        if (!imageUrl) {
          throw new Error('Failed to upload file');
        }
      }

      // Create post in database
      const { error } = await supabase
        .from('page_posts')
        .insert({
          page_id: pageId,
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
          post_type: formData.post_type,
          is_featured: formData.is_featured,
          created_by: user.id
        });

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: "Your post has been created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        post_type: 'general',
        is_featured: false
      });
      setSelectedFile(null);
      setPreview('');
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <span>Create New Post</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Input
              placeholder="Post title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-800 border-gray-600"
            />
          </div>

          {/* Content */}
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-gray-800 border-gray-600 min-h-[80px]"
              maxLength={1000}
            />
          </div>

          {/* Post Type */}
          <div>
            <Select value={formData.post_type} onValueChange={(value) => setFormData({ ...formData, post_type: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Photo/Video
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Max size: 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <video 
                  src={preview} 
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              )}
              <Button
                onClick={removeFile}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-300">
              Mark as featured post
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isUploading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isUploading ? "Creating Post..." : "Create Post 🚀"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostCreationModal;
