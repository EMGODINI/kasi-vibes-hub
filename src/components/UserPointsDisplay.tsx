import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPoints {
  id: string;
  points: number;
  level_name: string;
  badges: string[];
}

const levels = [
  { name: 'Roll Up Rookie', minPoints: 0, color: 'text-gray-500' },
  { name: 'Kasi OG', minPoints: 100, color: 'text-roll-up-neon-green' },
  { name: 'Skywalker', minPoints: 500, color: 'text-roll-up-ultraviolet' },
  { name: 'Cannabis Connoisseur', minPoints: 1000, color: 'text-roll-up-hazy-magenta' },
  { name: 'Roll Master', minPoints: 2500, color: 'text-orange-500' },
];

const badgeIcons: { [key: string]: React.ReactNode } = {
  'first_post': <Star className="h-4 w-4" />,
  'social_butterfly': <Trophy className="h-4 w-4" />,
  'consistent_roller': <Zap className="h-4 w-4" />,
  'community_hero': <Award className="h-4 w-4" />,
};

const UserPointsDisplay: React.FC = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        // Create initial points record if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            points: 0,
            level_name: 'Roll Up Rookie',
            badges: [],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setUserPoints(newData);
      } else if (data) {
        setUserPoints(data);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    if (!userPoints) return levels[0];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (userPoints.points >= levels[i].minPoints) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const getNextLevel = () => {
    if (!userPoints) return levels[1];
    
    const currentLevel = getCurrentLevel();
    const currentIndex = levels.findIndex(l => l.name === currentLevel.name);
    return levels[currentIndex + 1] || levels[levels.length - 1];
  };

  const getProgressToNextLevel = () => {
    if (!userPoints) return 0;
    
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (currentLevel.name === nextLevel.name) return 100; // Max level
    
    const pointsInCurrentLevel = userPoints.points - currentLevel.minPoints;
    const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
    
    return Math.min((pointsInCurrentLevel / pointsNeededForNext) * 100, 100);
  };

  if (!user || loading) {
    return (
      <Card className="glass-tile">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-roll-up-deep-purple/20 rounded mb-2"></div>
            <div className="h-3 bg-roll-up-hazy-magenta/20 rounded w-3/4 mb-3"></div>
            <div className="h-2 bg-roll-up-ultraviolet/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getProgressToNextLevel();

  return (
    <Card className="glass-tile animate-roll-up-glow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-roll-up-ultraviolet">
              {userPoints?.points || 0} Points
            </p>
            <p className={`text-xs font-bold ${currentLevel.color}`}>
              {currentLevel.name}
            </p>
          </div>
          <Trophy className="h-5 w-5 text-roll-up-neon-green" />
        </div>
        
        {currentLevel.name !== nextLevel.name && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-roll-up-hazy-magenta">Next: {nextLevel.name}</span>
              <span className="text-roll-up-hazy-magenta">
                {nextLevel.minPoints - (userPoints?.points || 0)} more
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-roll-up-deep-purple/20"
            />
          </div>
        )}
        
        {userPoints?.badges && userPoints.badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-roll-up-ultraviolet">Badges:</p>
            <div className="flex flex-wrap gap-1">
              {userPoints.badges.map((badge, index) => (
                <Badge 
                  key={index}
                  className="bg-roll-up-ultraviolet/20 text-roll-up-ultraviolet text-xs flex items-center gap-1"
                >
                  {badgeIcons[badge] || <Star className="h-3 w-3" />}
                  {badge.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPointsDisplay;