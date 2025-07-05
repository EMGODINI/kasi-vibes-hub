import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Upload, Plus, Image, MessageSquare, Eye, EyeOff, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon_url?: string;
  thumbnail_url?: string;
  audio_url?: string;
  audio_title?: string;
  auto_play_audio: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

interface PagePost {
  id: string;
  page_id: string;
  title: string;
  content?: string;
  image_url?: string;
  post_type: string;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const PageManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [pages, setPages] = useState<AppPage[]>([]);
  const [posts, setPosts] = useState<PagePost[]>([]);
  const [selectedPage, setSelectedPage] = useState<AppPage | null>(null);
  const [editingPage, setEditingPage] = useState<AppPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states
  const [pageForm, setPageForm] = useState({
    name: '',
    title: '',
    description: '',
    slug: '',
    audio_title: '',
    auto_play_audio: false
  });

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    post_type: 'general',
    is_featured: false
  });

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchPagePosts(selectedPage.id);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      console.log('Fetching pages...');
      const { data, error } = await supabase
        .from('app_pages')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error fetching pages:', error);
        throw error;
      }
      
      console.log('Fetched pages:', data);
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pages. Please check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPagePosts = async (pageId: string) => {
    try {
      console.log('Fetching posts for page:', pageId);
      const { data, error } = await supabase
        .from('page_posts')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      console.log('Fetched posts:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File, type: 'icon' | 'thumbnail', pageId: string) => {
    console.log('Starting file upload:', { type, pageId, fileName: file.name });
    
    if (type === 'icon') setUploadingIcon(true);
    else setUploadingThumbnail(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageId}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading file to storage:', filePath);
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

      console.log('File uploaded, updating database with URL:', publicUrl);

      const updateField = type === 'icon' ? 'icon_url' : 'thumbnail_url';
      const { error: updateError } = await supabase
        .from('app_pages')
        .update({ [updateField]: publicUrl })
        .eq('id', pageId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `${type === 'icon' ? 'Icon' : 'Thumbnail'} updated successfully`,
      });

      fetchPages();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}. Check console for details.`,
        variant: "destructive"
      });
    } finally {
      if (type === 'icon') setUploadingIcon(false);
      else setUploadingThumbnail(false);
    }
  };

  const handleAudioUpload = async (file: File, pageId: string) => {
    console.log('Starting audio upload:', { pageId, fileName: file.name });
    
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for audio
      toast({
        title: "File too large",
        description: "Please select an audio file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingAudio(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `page-audio/${pageId}/${Date.now()}.${fileExt}`;

      console.log('Uploading audio to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from('page-assets')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Audio upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('page-assets')
        .getPublicUrl(fileName);

      console.log('Audio uploaded, updating database with URL:', publicUrl);

      const { error: updateError } = await supabase
        .from('app_pages')
        .update({ 
          audio_url: publicUrl,
          audio_title: file.name.replace(/\.[^/.]+$/, ""),
          auto_play_audio: true
        })
        .eq('id', pageId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Audio track updated successfully",
      });

      fetchPages();
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Error",
        description: "Failed to upload audio. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleCreatePage = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create pages",
        variant: "destructive"
      });
      return;
    }

    console.log('Creating page:', pageForm);
    
    try {
      const { error } = await supabase
        .from('app_pages')
        .insert({
          ...pageForm,
          created_by: user.id,
          order_index: pages.length + 1
        });

      if (error) {
        console.error('Error creating page:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Page created successfully",
      });

      setPageForm({ 
        name: '', 
        title: '', 
        description: '', 
        slug: '',
        audio_title: '',
        auto_play_audio: false
      });
      setCreateDialogOpen(false);
      fetchPages();
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Error",
        description: "Failed to create page. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePage = async () => {
    if (!editingPage) return;

    console.log('Updating page:', editingPage.id, pageForm);

    try {
      const { error } = await supabase
        .from('app_pages')
        .update(pageForm)
        .eq('id', editingPage.id);

      if (error) {
        console.error('Error updating page:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Page updated successfully",
      });

      setEditingPage(null);
      setPageForm({ 
        name: '', 
        title: '', 
        description: '', 
        slug: '',
        audio_title: '',
        auto_play_audio: false
      });
      setEditDialogOpen(false);
      fetchPages();
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive"
      });
    }
  };

  const handleTogglePageStatus = async (pageId: string, isActive: boolean) => {
    console.log('Toggling page status:', pageId, !isActive);
    
    try {
      const { error } = await supabase
        .from('app_pages')
        .update({ is_active: !isActive })
        .eq('id', pageId);

      if (error) {
        console.error('Error toggling page status:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Page ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchPages();
    } catch (error) {
      console.error('Error toggling page status:', error);
      toast({
        title: "Error",
        description: "Failed to update page status",
        variant: "destructive"
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    console.log('Deleting page:', pageId);
    
    try {
      const { error } = await supabase
        .from('app_pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        console.error('Error deleting page:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Page deleted successfully",
      });

      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    }
  };

  const handleCreatePost = async () => {
    if (!selectedPage || !user) {
      toast({
        title: "Error",
        description: "Please select a page and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    console.log('Creating post:', postForm, 'for page:', selectedPage.id);

    try {
      const { error } = await supabase
        .from('page_posts')
        .insert({
          ...postForm,
          page_id: selectedPage.id,
          created_by: user.id
        });

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      setPostForm({ title: '', content: '', post_type: 'general', is_featured: false });
      fetchPagePosts(selectedPage.id);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Check console for details.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading page management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Management</h2>
          <p className="text-muted-foreground">Manage all pages, icons, thumbnails, audio tracks, and content</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>Add a new page to the application</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Page Name</Label>
                <Input
                  id="name"
                  value={pageForm.name}
                  onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                  placeholder="e.g., My New Page"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., my-new-page"
                />
              </div>
              <div>
                <Label htmlFor="title">Display Title</Label>
                <Input
                  id="title"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="e.g., My New Page"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={pageForm.description}
                  onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                  placeholder="Brief description of this page"
                />
              </div>
              <div>
                <Label htmlFor="audio-title">Audio Title (Optional)</Label>
                <Input
                  id="audio-title"
                  value={pageForm.audio_title}
                  onChange={(e) => setPageForm({ ...pageForm, audio_title: e.target.value })}
                  placeholder="Enter audio track title"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-play"
                  checked={pageForm.auto_play_audio}
                  onChange={(e) => setPageForm({ ...pageForm, auto_play_audio: e.target.checked })}
                  className="rounded border-orange-200"
                />
                <Label htmlFor="auto-play" className="text-sm">Auto-play audio when users enter page</Label>
              </div>
              <Button onClick={handleCreatePage} className="w-full" disabled={!pageForm.name || !pageForm.slug || !pageForm.title}>
                Create Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">All Pages ({pages.length})</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>Manage page settings, icons, thumbnails, and audio tracks</CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pages found. Create your first page above.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Thumbnail</TableHead>
                      <TableHead>Audio</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={page.icon_url} />
                              <AvatarFallback>{page.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`icon-${page.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, 'icon', page.id);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`icon-${page.id}`)?.click()}
                                disabled={uploadingIcon}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploadingIcon ? 'Uploading...' : 'Change Icon'}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-muted-foreground">/{page.slug}</div>
                            {page.description && (
                              <div className="text-xs text-muted-foreground mt-1">{page.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_active ? "default" : "secondary"}>
                            {page.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {page.thumbnail_url && (
                              <img src={page.thumbnail_url} alt="Thumbnail" className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`thumb-${page.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, 'thumbnail', page.id);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`thumb-${page.id}`)?.click()}
                                disabled={uploadingThumbnail}
                              >
                                <Image className="w-3 h-3 mr-1" />
                                {uploadingThumbnail ? 'Uploading...' : 'Set Thumbnail'}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {page.audio_url && (
                              <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 rounded px-2 py-1">
                                <Music className="w-3 h-3" />
                                <span>{page.audio_title || 'Audio Track'}</span>
                              </div>
                            )}
                            <div>
                              <Input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                id={`audio-${page.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAudioUpload(file, page.id);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`audio-${page.id}`)?.click()}
                                disabled={uploadingAudio}
                                title="Upload Audio Track"
                              >
                                <Music className="w-3 h-3 mr-1" />
                                {uploadingAudio ? 'Uploading...' : 'Set Audio'}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPage(page)}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Posts
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPage(page);
                                setPageForm({
                                  name: page.name,
                                  title: page.title,
                                  description: page.description || '',
                                  slug: page.slug,
                                  audio_title: page.audio_title || '',
                                  auto_play_audio: page.auto_play_audio
                                });
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePageStatus(page.id, page.is_active)}
                            >
                              {page.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Page</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{page.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePage(page.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          {selectedPage ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content for {selectedPage.title}</CardTitle>
                  <CardDescription>Create and manage posts for this page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="post-title">Post Title</Label>
                      <Input
                        id="post-title"
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        placeholder="Enter post title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-type">Post Type</Label>
                      <Input
                        id="post-type"
                        value={postForm.post_type}
                        onChange={(e) => setPostForm({ ...postForm, post_type: e.target.value })}
                        placeholder="e.g., music, news, photo"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="post-content">Content</Label>
                    <Textarea
                      id="post-content"
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      placeholder="Write your post content here..."
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={postForm.is_featured}
                      onChange={(e) => setPostForm({ ...postForm, is_featured: e.target.checked })}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>
                  <Button onClick={handleCreatePost} disabled={!postForm.title}>
                    Create Post
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Posts ({posts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {posts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No posts yet. Create your first post above.</p>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{post.title}</h4>
                              {post.content && (
                                <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <span>Type: {post.post_type}</span>
                                <span>Likes: {post.likes_count}</span>
                                <span>Comments: {post.comments_count}</span>
                                {post.is_featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Select a page from the "All Pages" tab to manage its content.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Page Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>Update page information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Page Name</Label>
              <Input
                id="edit-name"
                value={pageForm.name}
                onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">URL Slug</Label>
              <Input
                id="edit-slug"
                value={pageForm.slug}
                onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Display Title</Label>
              <Input
                id="edit-title"
                value={pageForm.title}
                onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={pageForm.description}
                onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-audio-title">Audio Title</Label>
              <Input
                id="edit-audio-title"
                value={pageForm.audio_title}
                onChange={(e) => setPageForm({ ...pageForm, audio_title: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-auto-play"
                checked={pageForm.auto_play_audio}
                onChange={(e) => setPageForm({ ...pageForm, auto_play_audio: e.target.checked })}
                className="rounded border-orange-200"
              />
              <Label htmlFor="edit-auto-play" className="text-sm">Auto-play audio when users enter page</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUpdatePage} className="flex-1">
                Update Page
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageManager;