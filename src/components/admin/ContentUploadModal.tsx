import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/ui/file-upload';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AppPage {
  slug: string;
  name: string;
  title: string;
}

interface ContentUploadModalProps {
  onContentUploaded?: () => void;
  triggerText?: string;
  defaultPageSlug?: string;
}

export const ContentUploadModal: React.FC<ContentUploadModalProps> = ({
  onContentUploaded,
  triggerText = "Upload Content",
  defaultPageSlug = ""
}) => {
  const [open, setOpen] = useState(false);
  const [appPages, setAppPages] = useState<AppPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentPreview, setContentPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    page_slug: defaultPageSlug,
    content_type: 'image' as 'image' | 'video' | 'audio'
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchAppPages();
    }
  }, [open]);

  const fetchAppPages = async () => {
    try {
      const { data, error } = await supabase
        .from('app_pages')
        .select('slug, name, title')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setAppPages(data || []);
    } catch (error) {
      console.error('Error fetching app pages:', error);
      toast({
        title: "Error",
        description: "Failed to load app pages",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (file: File) => {
    setContentFile(file);
    
    // Determine content type based on file
    if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, content_type: 'image' }));
    } else if (file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, content_type: 'video' }));
    } else if (file.type.startsWith('audio/')) {
      setFormData(prev => ({ ...prev, content_type: 'audio' }));
    }
    
    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => setContentPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setContentPreview('');
    }
  };

  const handleFileRemove = () => {
    setContentFile(null);
    setContentPreview('');
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contentFile) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload file
      setUploadProgress(30);
      const fileExt = contentFile.name.split('.').pop();
      const fileName = `content/${formData.page_slug}/${Date.now()}.${fileExt}`;
      const fileUrl = await uploadFile(contentFile, 'page-assets', fileName);
      
      setUploadProgress(60);

      // Save to database based on content type
      if (formData.content_type === 'image') {
        // Save as page post
        const { error } = await supabase
          .from('page_posts')
          .insert({
            title: formData.title,
            content: formData.description,
            image_url: fileUrl,
            post_type: formData.page_slug,
            created_by: user.id
          });

        if (error) throw error;
      } else {
        // Save as general content
        const { error } = await supabase
          .from('content')
          .insert({
            title: formData.title,
            description: formData.description,
            image_url: fileUrl,
            content_type: formData.content_type,
            created_by: user.id
          });

        if (error) throw error;
      }

      setUploadProgress(100);
      
      toast({
        title: "Success",
        description: "Content uploaded successfully!",
      });

      // Reset form
      setFormData({ title: '', description: '', page_slug: defaultPageSlug, content_type: 'image' });
      setContentFile(null);
      setContentPreview('');
      setOpen(false);
      
      onContentUploaded?.();

    } catch (error: any) {
      console.error('Error uploading content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="page_slug">Assign To Page</Label>
              <Select 
                value={formData.page_slug} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, page_slug: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {appPages.map((page) => (
                    <SelectItem key={page.slug} value={page.slug}>
                      {page.title || page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter content description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Upload File</Label>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              accept="image/*,video/*,audio/*"
              maxSize={50}
              preview={contentPreview}
              dragText="Drop your content file here"
              buttonText="Select File"
            />
          </div>

          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          <Button type="submit" disabled={isLoading || !contentFile} className="w-full">
            {isLoading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};