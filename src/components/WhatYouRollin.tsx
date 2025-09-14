import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Upload, Camera, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface RollUpPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  vibe_tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const vibeOptions = [
  'Chill', 'Loud', 'Creeper', 'Skywalkin\'', 'Mellow', 'Energetic', 
  'Focused', 'Relaxed', 'Creative', 'Social', 'Solo', 'Party'
];

const WhatYouRollin: React.FC = () => {
  const [posts, setPosts] = useState<RollUpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('roll_up_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Fetch profiles separately for now
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.user_id)
            .single();
          
          return {
            ...post,
            profiles: profile || undefined
          };
        })
      );
      
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
    }
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) 
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

  const handleUpload = async () => {
    if (!user || !uploadFile || !caption.trim()) {
      toast({
        title: "Missing information",
        description: "Please add an image and caption",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(`roll-up/${fileName}`, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(`roll-up/${fileName}`);

      // Create post in database
      const { error: insertError } = await supabase
        .from('roll_up_posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption: caption.trim(),
          vibe_tags: selectedVibes,
        });

      if (insertError) throw insertError;

      toast({
        title: "Posted! 🔥",
        description: "Your roll up is live!",
      });

      // Reset form and refresh posts
      setUploadFile(null);
      setCaption('');
      setSelectedVibes([]);
      setUploadOpen(false);
      fetchPosts();

    } catch (error) {
      console.error('Error uploading post:', error);
      toast({
        title: "Upload failed",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('roll_up_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (error && error.code !== '23505') { // 23505 = unique constraint violation
        throw error;
      }

      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-tile animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-roll-up-deep-purple/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-roll-up-hazy-magenta/20 rounded mb-2"></div>
                  <div className="h-3 bg-roll-up-ultraviolet/20 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-64 bg-roll-up-neon-green/10 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
          What You Rollin'? 🌿
        </h2>
        
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80">
              <Plus className="mr-2 h-4 w-4" />
              Share Your Roll
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-roll-up-ultraviolet">Share Your Setup 🔥</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-roll-up-hazy-magenta/30 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {uploadFile ? (
                    <div className="space-y-2">
                      <img 
                        src={URL.createObjectURL(uploadFile)} 
                        alt="Preview" 
                        className="max-h-32 mx-auto rounded"
                      />
                      <p className="text-sm text-roll-up-hazy-magenta">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 mx-auto text-roll-up-ultraviolet" />
                      <p className="text-roll-up-hazy-magenta">Upload your joint pic</p>
                    </div>
                  )}
                </label>
              </div>
              
              <Textarea
                placeholder="Tell us about this roll..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="border-roll-up-hazy-magenta/30 focus:border-roll-up-neon-green"
              />
              
              <div>
                <p className="text-sm font-medium text-roll-up-ultraviolet mb-2">Vibe Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {vibeOptions.map((vibe) => (
                    <Badge
                      key={vibe}
                      variant={selectedVibes.includes(vibe) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedVibes.includes(vibe)
                          ? 'bg-roll-up-neon-green text-black'
                          : 'border-roll-up-hazy-magenta/30 hover:bg-roll-up-ultraviolet/10'
                      }`}
                      onClick={() => toggleVibe(vibe)}
                    >
                      {vibe}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !caption.trim() || uploading}
                className="w-full bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80"
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Drop Your Roll 🔥
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="glass-tile hover:animate-roll-up-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-roll-up-deep-purple text-white">
                    {post.profiles?.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-roll-up-ultraviolet">
                    {post.profiles?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-roll-up-hazy-magenta">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden mb-4">
                <img 
                  src={post.image_url} 
                  alt={post.caption}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <p className="text-roll-up-hazy-magenta mb-3 leading-relaxed">
                {post.caption}
              </p>
              
              {post.vibe_tags && post.vibe_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.vibe_tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      className="bg-roll-up-ultraviolet/20 text-roll-up-ultraviolet border-roll-up-ultraviolet/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="text-roll-up-hazy-magenta hover:text-roll-up-neon-green"
                >
                  <Heart className="mr-1 h-4 w-4" />
                  {post.likes_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-roll-up-hazy-magenta hover:text-roll-up-ultraviolet"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {post.comments_count}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WhatYouRollin;