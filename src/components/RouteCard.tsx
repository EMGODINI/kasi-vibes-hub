import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Share, MapPin, Clock, Ruler } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Route {
  id: string;
  route_name: string;
  description?: string;
  start_location: string;
  end_location: string;
  distance_km?: number;
  duration_minutes?: number;
  route_path?: any; // JSONB
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface RouteCardProps {
  route: Route;
  onRouteUpdate?: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onRouteUpdate }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(route.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const checkLikeStatus = async () => {
      const { data } = await supabase
        .from('route_likes')
        .select('id')
        .eq('route_id', route.id)
        .eq('user_id', profile.id)
        .single();

      setIsLiked(!!data);
    };

    checkLikeStatus();
  }, [route.id, profile]);

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('route_likes')
          .delete()
          .eq('route_id', route.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('route_likes')
          .insert({
            route_id: route.id,
            user_id: profile.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return;

    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('route_comments')
        .select(`
          id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('route_id', route.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading comments",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleShowComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('route_comments')
        .insert({
          route_id: route.id,
          user_id: profile.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setNewComment('');
      onRouteUpdate?.();

      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error: any) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-4">
      <CardContent className="p-4">
        {/* Route Header */}
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={route.profiles.avatar_url} />
            <AvatarFallback className="bg-orange-600 text-white">
              {route.profiles.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold">{route.profiles.username}</p>
            <p className="text-gray-400 text-sm">
              {formatDistanceToNow(new Date(route.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Route Content */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-2">{route.route_name}</h3>
          <p className="text-gray-300 text-sm mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> {route.start_location} to {route.end_location}
          </p>
          {route.distance_km && (
            <p className="text-gray-400 text-sm mb-1 flex items-center">
              <Ruler className="w-4 h-4 mr-1" /> Distance: {route.distance_km} km
            </p>
          )}
          {route.duration_minutes && (
            <p className="text-gray-400 text-sm mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Duration: {route.duration_minutes} minutes
            </p>
          )}
          {route.description && (
            <p className="text-white whitespace-pre-wrap mb-3">{route.description}</p>
          )}
        </div>

        {/* Route Actions */}
        <div className="flex items-center space-x-6 py-2 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`text-gray-400 hover:text-red-400 ${isLiked ? 'text-red-400' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowComments}
            className="text-gray-400 hover:text-blue-400"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {route.comments_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-green-400"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            {/* Comment Form */}
            {profile && (
              <form onSubmit={handleSubmitComment} className="mb-4">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-orange-600 text-white text-sm">
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 min-h-[60px] resize-none"
                      maxLength={300}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <p className="text-gray-400 text-center py-4">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles.avatar_url} />
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {comment.profiles.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-orange-400 font-semibold text-sm">
                          {comment.profiles.username}
                        </p>
                        <p className="text-white text-sm">{comment.content}</p>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteCard;


