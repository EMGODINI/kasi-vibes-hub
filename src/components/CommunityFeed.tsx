import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MoreVertical, Send, Bookmark, Eye, MessageSquare } from 'lucide-react';
import SocialActions from '@/components/SocialActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AudioPlayer from './AudioPlayer';

interface Post {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  post_type: string;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  shared_count: number;
  created_at: string;
  page_id: string;
  created_by?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface CommunityFeedProps {
  posts: Post[];
  pages: any[];
  onPostUpdate?: () => void;
}

const CommunityFeed = ({ posts, pages, onPostUpdate }: CommunityFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);
    
    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    
    setLikedPosts(newLikedPosts);

    try {
      // Update likes count in database
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost) {
        const newCount = isLiked ? currentPost.likes_count - 1 : currentPost.likes_count + 1;
        
        const { error } = await supabase
          .from('page_posts')
          .update({ likes_count: newCount })
          .eq('id', postId);

        if (error) throw error;
        
        if (onPostUpdate) onPostUpdate();
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update
      setLikedPosts(likedPosts);
    }
  };

  const handleSave = (postId: string) => {
    const newSavedPosts = new Set(savedPosts);
    if (savedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);
    
    toast({
      title: savedPosts.has(postId) ? "Removed from saved" : "Saved to collection",
      description: savedPosts.has(postId) ? "Post removed from your saved items" : "You can find this in your saved posts",
    });
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          content: newComment.trim(),
          created_by: user.id
        });

      if (error) throw error;

      setNewComment('');
      loadComments(postId);
      
      // Update comments count
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost) {
        const { error: updateError } = await supabase
          .from('page_posts')
          .update({ comments_count: currentPost.comments_count + 1 })
          .eq('id', postId);

        if (!updateError && onPostUpdate) onPostUpdate();
      }

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    }
  };

  const toggleComments = (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  const PostCard = ({ post }: { post: Post }) => {
    const page = pages.find(p => p.id === post.page_id);
    const isLiked = likedPosts.has(post.id);
    const isSaved = savedPosts.has(post.id);
    const isAudioPost = post.post_type === 'music' || (post.image_url && post.image_url.includes('.mp3'));
    
    return (
      <Card className="mb-6 hover:shadow-xl transition-all duration-300 border-0 enhanced-glass border border-orange-500/20 transform hover:scale-[1.01] spring-bounce">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-orange-500/50 spring-bounce hover:ring-orange-400">
                <AvatarImage src={page?.icon_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {page?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm text-white">{page?.name || 'Unknown'}</p>
                  {post.is_featured && (
                    <Badge className="bg-orange-600 text-white text-xs animate-pulse">Featured</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave(post.id)}
                className={`${isSaved ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-500 touch-target`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white touch-target">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-white mb-2">{post.title}</h3>
          {post.content && (
            <p className="mb-3 text-sm text-gray-300">{post.content}</p>
          )}
          
          {/* Audio Player for music posts */}
          {isAudioPost && post.image_url && (
            <div className="mb-4">
              <AudioPlayer
                audioUrl={post.image_url}
                title={post.title}
                isPlaying={playingAudio === post.id}
                onPlayPause={() => {
                  setPlayingAudio(playingAudio === post.id ? null : post.id);
                }}
              />
            </div>
          )}
          
          {/* Image/Video for non-audio posts */}
          {post.image_url && !isAudioPost && (
            <div className="mb-3 rounded-lg overflow-hidden">
              {post.post_type === 'video' ? (
                <video 
                  src={post.image_url} 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                  controls
                />
              ) : (
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          )}
          
          {/* Social Actions */}
          <SocialActions
            postId={post.id}
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            sharedCount={post.shared_count || 0}
            authorId={post.created_by}
            onLikeUpdate={(newCount) => {
              if (onPostUpdate) onPostUpdate();
            }}
            onShareUpdate={(newCount) => {
              if (onPostUpdate) onPostUpdate();
            }}
          />

          {/* View Stats */}
          <div className="flex justify-end mt-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{post.likes_count + post.comments_count * 3}</span>
            </div>
          </div>

          {/* Comments Section */}
          {showComments === post.id && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {comments[post.id]?.map((comment) => (
                  <div key={comment.id} className="flex space-x-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gray-600 text-white text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-gray-300">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">No comments yet</p>}
              </div>
              
              {user && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                  />
                  <Button
                    onClick={() => handleComment(post.id)}
                    disabled={!newComment.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-sm border-0">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 text-lg mb-2">No posts in the community yet</p>
            <p className="text-gray-500">Be the first to share something amazing!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default CommunityFeed;