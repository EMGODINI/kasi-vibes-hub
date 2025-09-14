import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  sharedCount: number;
  authorId?: string;
  onLikeUpdate: (newCount: number) => void;
  onShareUpdate: (newCount: number) => void;
}

const SocialActions = ({ 
  postId, 
  likesCount, 
  commentsCount, 
  sharedCount, 
  authorId,
  onLikeUpdate,
  onShareUpdate 
}: SocialActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      if (authorId) {
        checkFollowStatus();
      }
    }
  }, [user, postId, authorId]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
        
      setIsLiked(!!data);
    } catch (error) {
      // User hasn't liked this post
      setIsLiked(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !authorId || user.id === authorId) return;
    
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', authorId)
        .single();
        
      setIsFollowing(!!data);
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const handleLike = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        // Update post likes count
        await supabase
          .from('page_posts')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', postId);
          
        setIsLiked(false);
        onLikeUpdate(Math.max(0, likesCount - 1));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
          
        // Update post likes count
        await supabase
          .from('page_posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', postId);
          
        setIsLiked(true);
        onLikeUpdate(likesCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Copy link to clipboard
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      
      // Update share count
      await supabase
        .from('page_posts')
        .update({ 
          shared_count: sharedCount + 1,
          is_shared: true 
        })
        .eq('id', postId);
        
      onShareUpdate(sharedCount + 1);
      
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  const handleFollow = async () => {
    if (!user || !authorId || user.id === authorId || loading) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', authorId);
          
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user",
        });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, followed_id: authorId });
          
        setIsFollowing(true);
        toast({
          title: "Following!",
          description: "You are now following this user",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={loading}
          className={`${isLiked 
            ? 'text-red-500 hover:text-red-400' 
            : 'text-gray-400 hover:text-red-500'
          } touch-target spring-bounce`}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
          <MessageSquare className="w-4 h-4 mr-1" />
          {commentsCount}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="text-gray-400 hover:text-blue-500 touch-target spring-bounce"
        >
          <Share className="w-4 h-4 mr-1" />
          {sharedCount}
        </Button>
      </div>
      
      {/* Follow button - only show if it's not the current user's post */}
      {authorId && user && user.id !== authorId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFollow}
          disabled={loading}
          className={`${isFollowing 
            ? 'text-green-500 hover:text-green-400' 
            : 'text-gray-400 hover:text-green-500'
          } touch-target spring-bounce`}
        >
          {isFollowing ? (
            <UserMinus className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default SocialActions;