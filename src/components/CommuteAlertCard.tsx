import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, MapPin, Clock, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

interface CommuteAlert {
  id: string;
  title: string;
  description?: string;
  alert_type: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  status: string;
  valid_until?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface CommuteAlertCardProps {
  alert: CommuteAlert;
  onAlertUpdate?: () => void;
}

const CommuteAlertCard = ({ alert, onAlertUpdate }: CommuteAlertCardProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(alert.likes_count);

  useEffect(() => {
    if (!profile) return;

    const checkUserLike = async () => {
      const { data } = await supabase
        .from('commute_alert_likes')
        .select('id')
        .eq('alert_id', alert.id)
        .eq('user_id', profile.id)
        .single();
      setIsLiked(!!data);
    };
    checkUserLike();
  }, [alert.id, profile]);

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('commute_alert_likes')
          .delete()
          .eq('alert_id', alert.id)
          .eq('user_id', profile.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('commute_alert_likes')
          .insert({
            alert_id: alert.id,
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-orange-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic_jam': return <AlertTriangle className="w-4 h-4 mr-1" />; 
      case 'accident': return <AlertTriangle className="w-4 h-4 mr-1" />; 
      case 'road_closure': return <AlertTriangle className="w-4 h-4 mr-1" />; 
      case 'public_transport_delay': return <Clock className="w-4 h-4 mr-1" />; 
      case 'public_transport_breakdown': return <AlertTriangle className="w-4 h-4 mr-1" />; 
      case 'protest': return <Users className="w-4 h-4 mr-1" />; 
      case 'weather_hazard': return <CloudRain className="w-4 h-4 mr-1" />; 
      default: return <AlertTriangle className="w-4 h-4 mr-1" />; 
    }
  };

  const formatValidUntil = (dateStr?: string) => {
    if (!dateStr) return 'Ongoing';
    try {
      const date = parseISO(dateStr);
      return `Valid until ${format(date, 'MMM d, yyyy HH:mm')}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-red-500/30 mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">{alert.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                {alert.severity.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                {getAlertTypeIcon(alert.alert_type)}
                {alert.alert_type.replace(/_/g, ' ')}
              </Badge>
            </div>
            
            {alert.location_name && (
              <div className="flex items-center space-x-1 text-gray-400 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{alert.location_name}</span>
              </div>
            )}

            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {alert.description || 'No description provided.'}
            </p>

            <div className="flex items-center space-x-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{formatValidUntil(alert.valid_until)}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={alert.profiles.avatar_url} />
            <AvatarFallback className="bg-red-600 text-white text-xs">
              {alert.profiles.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-gray-400 text-sm">
            Posted by {alert.profiles.username}
          </span>
          <span className="text-gray-500 text-xs">
            • {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-gray-400 hover:text-blue-400 ${isLiked ? 'text-blue-400' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-400"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {alert.comments_count}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommuteAlertCard;

