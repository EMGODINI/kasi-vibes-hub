import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BadgeIconProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

const BadgeIcon = ({ userId, size = 'md' }: BadgeIconProps) => {
  const [badges, setBadges] = useState<{ badge_type: string }[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('badge_type')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      setBadges(data || []);
    };

    fetchBadges();
  }, [userId]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const adminBadge = badges.find(b => b.badge_type === 'admin');
  const verifiedBadge = badges.find(b => b.badge_type === 'verified');

  return (
    <span className={`inline-flex items-center space-x-1 ${sizeClasses[size]}`}>
      {adminBadge && (
        <span 
          className="animate-pulse" 
          style={{ 
            filter: 'drop-shadow(0 0 4px #8b5cf6)',
            textShadow: '0 0 8px #8b5cf6'
          }}
          title="Admin"
        >
          💎
        </span>
      )}
      {verifiedBadge && !adminBadge && (
        <span 
          className="animate-pulse"
          style={{ 
            filter: 'drop-shadow(0 0 4px #3b82f6)',
            textShadow: '0 0 8px #3b82f6'
          }}
          title="Verified"
        >
          ✅
        </span>
      )}
    </span>
  );
};

export default BadgeIcon;