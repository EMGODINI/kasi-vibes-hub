
import { ContentUploadModal } from './admin/ContentUploadModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ContentUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const refreshContent = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-content'] });
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
      {/* Enhanced Upload Interface */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm border border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Management</span>
            <ContentUploadModal 
              onContentUploaded={refreshContent}
              triggerText="Upload New Content"
            />
          </CardTitle>
          <CardDescription>
            Upload and manage content across all app pages with drag-and-drop uploads
          </CardDescription>
        </CardHeader>
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
