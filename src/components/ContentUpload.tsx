
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ContentUpload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'general' as 'hero_image' | 'profile_image' | 'background_image' | 'general'
  });

  // Fetch existing content
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the content.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.content_type}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Save content record to database
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: publicUrl,
          content_type: formData.content_type,
          created_by: user.id
        });

      if (dbError) throw dbError;

      // Reset form
      setFormData({ title: '', description: '', content_type: 'general' });
      (e.target as HTMLInputElement).value = '';
      
      // Refresh content list
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });

      toast({
        title: "Content uploaded successfully!",
        description: "The content is now available across the app.",
      });
    } catch (error: any) {
      console.error('Content upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleContentStatus = async (contentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ is_active: !currentStatus })
        .eq('id', contentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      
      toast({
        title: "Content updated",
        description: `Content ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteContent = async (contentId: string, imageUrl?: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (dbError) throw dbError;

      // Delete from storage if image exists
      if (imageUrl) {
        const filePath = imageUrl.split('/content/')[1];
        if (filePath) {
          await supabase.storage
            .from('content')
            .remove([filePath]);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      
      toast({
        title: "Content deleted",
        description: "Content has been permanently deleted.",
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
      <Card className="bg-white/50 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle>Upload Content</CardTitle>
          <CardDescription>Upload images and content to use across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value as any }))}
              >
                <SelectTrigger className="border-orange-200 focus:border-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="hero_image">Hero Image</SelectItem>
                  <SelectItem value="profile_image">Profile Image</SelectItem>
                  <SelectItem value="background_image">Background Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter content description"
              className="border-orange-200 focus:border-orange-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Image</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="border-orange-200 focus:border-orange-500"
            />
          </div>
          
          {isUploading && (
            <div className="flex items-center space-x-2 text-orange-600">
              <Upload className="w-4 h-4 animate-pulse" />
              <span>Uploading...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content List */}
      <Card className="bg-white/50 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle>Uploaded Content</CardTitle>
          <CardDescription>Manage your uploaded content</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading content...</div>
          ) : content.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content uploaded yet. Upload your first image above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-white/70">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.content_type.replace('_', ' ')}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleContentStatus(item.id, item.is_active)}
                        className={item.is_active ? "text-green-600" : "text-gray-500"}
                      >
                        {item.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContent(item.id, item.image_url)}
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

export default ContentUpload;
