import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Star, MapPin, Shield, Users, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SkateSpot {
  id: string;
  name: string;
  description?: string;
  location_name: string;
  image_url?: string;
  spot_type: string;
  difficulty_level: string;
  surface_type: string;
  is_public: boolean;
  is_legal: boolean;
  rating: number;
  ratings_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface SkateSpotCardProps {
  spot: SkateSpot;
  onSpotUpdate?: () => void;
}

const SkateSpotCard = ({ spot, onSpotUpdate }: SkateSpotCardProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(spot.likes_count);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);

  // Check if user has liked this spot and get their rating
  useEffect(() => {
    if (!profile) return;

    const checkUserInteractions = async () => {
      // Check like status
      const { data: likeData } = await supabase
        .from('skate_spot_likes')
        .select('id')
        .eq('spot_id', spot.id)
        .eq('user_id', profile.id)
        .single();

      setIsLiked(!!likeData);

      // Check user rating
      const { data: ratingData } = await supabase
        .from('skate_spot_ratings')
        .select('rating')
        .eq('spot_id', spot.id)
        .eq('user_id', profile.id)
        .single();

      if (ratingData) {
        setUserRating(ratingData.rating);
      }
    };

    checkUserInteractions();
  }, [spot.id, profile]);

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('skate_spot_likes')
          .delete()
          .eq('spot_id', spot.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('skate_spot_likes')
          .insert({
            spot_id: spot.id,
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

  const handleRating = async (rating: number) => {
    if (!profile) return;

    try {
      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('skate_spot_ratings')
          .update({ rating })
          .eq('spot_id', spot.id)
          .eq('user_id', profile.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('skate_spot_ratings')
          .insert({
            spot_id: spot.id,
            user_id: profile.id,
            rating
          });

        if (error) throw error;
      }

      setUserRating(rating);
      setShowRating(false);
      onSpotUpdate?.(); // Refresh to get updated rating

      toast({
        title: "Rating submitted",
        description: `You rated this spot ${rating} star${rating !== 1 ? 's' : ''}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-orange-600';
      case 'expert': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getSpotTypeIcon = (type: string) => {
    // You could add specific icons for different spot types
    return '🛹';
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-roll-up-neon-green/30 mb-4 overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        {spot.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={spot.image_url} 
              alt={spot.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              {!spot.is_legal && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Check Local Laws
                </Badge>
              )}
              {!spot.is_public && (
                <Badge variant="secondary" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{getSpotTypeIcon(spot.spot_type)}</span>
                <h3 className="text-white font-semibold text-lg">{spot.name}</h3>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{spot.location_name}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${getDifficultyColor(spot.difficulty_level)} text-white text-xs`}>
                  {spot.difficulty_level}
                </Badge>
                <Badge variant="outline" className="text-xs border-roll-up-neon-green/50 text-roll-up-neon-green">
                  {spot.spot_type}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                  {spot.surface_type}
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">
                  {spot.rating > 0 ? spot.rating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                {spot.ratings_count} rating{spot.ratings_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Description */}
          {spot.description && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {spot.description}
            </p>
          )}

          {/* User Info */}
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={spot.profiles.avatar_url} />
              <AvatarFallback className="bg-roll-up-neon-green text-black text-xs">
                {spot.profiles.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-400 text-sm">
              Shared by {spot.profiles.username}
            </span>
            <span className="text-gray-500 text-xs">
              • {formatDistanceToNow(new Date(spot.created_at), { addSuffix: true })}
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
                {spot.comments_count}
              </Button>
            </div>

            {/* Rating Section */}
            {profile && (
              <div className="flex items-center space-x-2">
                {showRating ? (
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(star)}
                        className="p-1 h-auto"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            star <= (userRating || 0) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRating(true)}
                    className="border-roll-up-neon-green/50 text-roll-up-neon-green hover:bg-roll-up-neon-green/10"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    {userRating ? `${userRating}★` : 'Rate'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkateSpotCard;

