import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Calendar, Clock, MapPin, Users, ExternalLink, Star, Phone } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

interface Gig {
  id: string;
  title: string;
  description?: string;
  artist_name: string;
  venue_name: string;
  venue_address?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  ticket_price?: number;
  ticket_url?: string;
  contact_info?: string;
  image_url?: string;
  genre?: string;
  event_type: string;
  capacity?: number;
  age_restriction: string;
  is_free: boolean;
  is_featured: boolean;
  status: string;
  likes_count: number;
  comments_count: number;
  interested_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface GigCardProps {
  gig: Gig;
  onGigUpdate?: () => void;
}

const GigCard = ({ gig, onGigUpdate }: GigCardProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [likesCount, setLikesCount] = useState(gig.likes_count);
  const [interestedCount, setInterestedCount] = useState(gig.interested_count);

  // Check if user has liked this gig or marked as interested
  useEffect(() => {
    if (!profile) return;

    const checkUserInteractions = async () => {
      // Check like status
      const { data: likeData } = await supabase
        .from('gig_likes')
        .select('id')
        .eq('gig_id', gig.id)
        .eq('user_id', profile.id)
        .single();

      setIsLiked(!!likeData);

      // Check interested status
      const { data: interestedData } = await supabase
        .from('gig_interested')
        .select('id')
        .eq('gig_id', gig.id)
        .eq('user_id', profile.id)
        .single();

      setIsInterested(!!interestedData);
    };

    checkUserInteractions();
  }, [gig.id, profile]);

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('gig_likes')
          .delete()
          .eq('gig_id', gig.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('gig_likes')
          .insert({
            gig_id: gig.id,
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

  const handleInterested = async () => {
    if (!profile) return;

    try {
      if (isInterested) {
        // Remove interest
        const { error } = await supabase
          .from('gig_interested')
          .delete()
          .eq('gig_id', gig.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsInterested(false);
        setInterestedCount(prev => prev - 1);
      } else {
        // Mark as interested
        const { error } = await supabase
          .from('gig_interested')
          .insert({
            gig_id: gig.id,
            user_id: profile.id
          });

        if (error) throw error;

        setIsInterested(true);
        setInterestedCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'concert': return 'bg-purple-600';
      case 'dj_set': return 'bg-blue-600';
      case 'festival': return 'bg-green-600';
      case 'club_night': return 'bg-pink-600';
      case 'open_mic': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getAgeRestrictionColor = (restriction: string) => {
    switch (restriction) {
      case 'all_ages': return 'bg-green-600';
      case '18+': return 'bg-yellow-600';
      case '21+': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEE, MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  const isUpcoming = new Date(gig.event_date) >= new Date();

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30 mb-4 overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        {gig.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={gig.image_url} 
              alt={gig.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex space-x-1">
              {gig.is_featured && (
                <Badge className="bg-yellow-600 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {!isUpcoming && (
                <Badge variant="secondary" className="text-xs">
                  Past Event
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Badge className={`${getEventTypeColor(gig.event_type)} text-white text-xs`}>
                {gig.event_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-1">{gig.title}</h3>
              <p className="text-purple-400 font-medium mb-2">{gig.artist_name}</p>
              
              {/* Date and Time */}
              <div className="flex items-center space-x-4 text-gray-400 text-sm mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatEventDate(gig.event_date)}</span>
                </div>
                {gig.event_time && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(gig.event_time)}
                      {gig.end_time && ` - ${formatTime(gig.end_time)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Venue */}
              <div className="flex items-center space-x-1 text-gray-400 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{gig.venue_name}</span>
                {gig.venue_address && <span>• {gig.venue_address}</span>}
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${getAgeRestrictionColor(gig.age_restriction)} text-white text-xs`}>
                  {gig.age_restriction}
                </Badge>
                {gig.genre && (
                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                    {gig.genre}
                  </Badge>
                )}
                {gig.is_free ? (
                  <Badge className="bg-green-600 text-white text-xs">
                    FREE
                  </Badge>
                ) : gig.ticket_price && (
                  <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                    R{gig.ticket_price}
                  </Badge>
                )}
              </div>
            </div>

            {/* Interested Count */}
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white font-semibold">{interestedCount}</span>
              </div>
              <p className="text-gray-400 text-xs">interested</p>
            </div>
          </div>

          {/* Description */}
          {gig.description && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {gig.description}
            </p>
          )}

          {/* Contact and Ticket Info */}
          {(gig.contact_info || gig.ticket_url) && (
            <div className="flex items-center space-x-4 mb-3 text-sm">
              {gig.contact_info && (
                <div className="flex items-center space-x-1 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{gig.contact_info}</span>
                </div>
              )}
              {gig.ticket_url && (
                <a 
                  href={gig.ticket_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Get Tickets</span>
                </a>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={gig.profiles.avatar_url} />
              <AvatarFallback className="bg-purple-600 text-white text-xs">
                {gig.profiles.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-400 text-sm">
              Posted by {gig.profiles.username}
            </span>
            <span className="text-gray-500 text-xs">
              • {formatDistanceToNow(new Date(gig.created_at), { addSuffix: true })}
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
                {gig.comments_count}
              </Button>
            </div>

            {/* Interested Button */}
            {profile && isUpcoming && (
              <Button
                variant={isInterested ? "default" : "outline"}
                size="sm"
                onClick={handleInterested}
                className={
                  isInterested 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                }
              >
                <Users className="w-4 h-4 mr-1" />
                {isInterested ? 'Interested' : 'I\'m Interested'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigCard;

