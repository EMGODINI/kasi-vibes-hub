import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Eye, Pin, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface ForumTopic {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface ForumTopicCardProps {
  topic: ForumTopic;
  onTopicUpdate?: () => void;
}

const ForumTopicCard = ({ topic, onTopicUpdate }: ForumTopicCardProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(topic.likes_count);

  useEffect(() => {
    if (!profile) return;

    const checkUserLike = async () => {
      const { data } = await supabase
        .from('forum_topic_likes')
        .select('id')
        .eq('topic_id', topic.id)
        .eq('user_id', profile.id)
        .single();
      setIsLiked(!!data);
    };
    checkUserLike();
  }, [topic.id, profile]);

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('forum_topic_likes')
          .delete()
          .eq('topic_id', topic.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('forum_topic_likes')
          .insert({
            topic_id: topic.id,
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

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-blue-500/30 mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link to={`/forum/topic/${topic.id}`} className="hover:underline">
              <h3 className="text-white font-semibold text-lg mb-1">{topic.title}</h3>
            </Link>
            {topic.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img 
                  src={topic.image_url} 
                  alt={topic.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {topic.content || 'No description provided.'}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {topic.is_pinned && <Pin className="w-5 h-5 text-blue-400" title="Pinned Topic" />}
            {topic.is_locked && <Lock className="w-5 h-5 text-red-400" title="Locked Topic" />}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={topic.profiles.avatar_url} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {topic.profiles.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-gray-400 text-sm">
            Posted by {topic.profiles.username}
          </span>
          <span className="text-gray-500 text-xs">
            • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-gray-400 hover:text-red-400 ${isLiked ? 'text-red-400' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-400"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {topic.comments_count}
            </Button>

            <div className="flex items-center space-x-1 text-gray-400">
              <Eye className="w-4 h-4" />
              <span>{topic.views_count}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumTopicCard;

