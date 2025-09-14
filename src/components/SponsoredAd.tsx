import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Eye, X } from 'lucide-react';

interface SponsoredAdData {
  id: string;
  advertiser_name: string;
  title: string;
  description?: string;
  image_url?: string;
  click_url?: string;
  ad_type: 'banner' | 'card' | 'sponsored_post' | 'video';
  clicks_count: number;
  impressions_count: number;
}

interface SponsoredAdProps {
  ad: SponsoredAdData;
  pageSlug: string;
  className?: string;
  onClose?: () => void; // For dismissible ads
  showCloseButton?: boolean;
}

const SponsoredAd = ({ ad, pageSlug, className = '', onClose, showCloseButton = false }: SponsoredAdProps) => {
  const { profile } = useAuth();
  const [hasViewed, setHasViewed] = useState(false);

  // Track impression when component mounts
  useEffect(() => {
    if (!hasViewed) {
      trackInteraction('view');
      setHasViewed(true);
    }
  }, []);

  const trackInteraction = async (type: 'view' | 'click') => {
    try {
      await supabase
        .from('ad_interactions')
        .insert({
          ad_id: ad.id,
          user_id: profile?.id || null,
          interaction_type: type,
          page_slug: pageSlug,
          user_agent: navigator.userAgent,
          ip_address: null // Will be handled by backend if needed
        });
    } catch (error) {
      console.error('Error tracking ad interaction:', error);
    }
  };

  const handleClick = async () => {
    await trackInteraction('click');
    if (ad.click_url) {
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  // Banner Ad Layout
  if (ad.ad_type === 'banner') {
    return (
      <div className={`relative ${className}`}>
        <Card className="backdrop-blur-md bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {ad.image_url && (
                  <img 
                    src={ad.image_url} 
                    alt={ad.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                      Sponsored
                    </Badge>
                    <span className="text-gray-400 text-xs">{ad.advertiser_name}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{ad.title}</h4>
                  {ad.description && (
                    <p className="text-gray-300 text-xs line-clamp-1">{ad.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {ad.click_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit
                  </Button>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Card Ad Layout
  if (ad.ad_type === 'card') {
    return (
      <div className={`relative ${className}`}>
        <Card className="backdrop-blur-md bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 overflow-hidden">
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <CardContent className="p-0">
            {ad.image_url && (
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={ad.image_url} 
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-blue-600 text-white text-xs">
                    Sponsored
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{ad.title}</h4>
                <span className="text-gray-400 text-xs">{ad.advertiser_name}</span>
              </div>
              
              {ad.description && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{ad.description}</p>
              )}
              
              {ad.click_url && (
                <Button
                  onClick={handleClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              )}
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Ad by {ad.advertiser_name}</span>
                <div className="flex items-center space-x-2">
                  <span>{ad.impressions_count} views</span>
                  <span>•</span>
                  <span>{ad.clicks_count} clicks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sponsored Post Layout (looks like a regular post but marked as sponsored)
  if (ad.ad_type === 'sponsored_post') {
    return (
      <div className={`relative ${className}`}>
        <Card className="backdrop-blur-md bg-gray-900/70 border border-green-500/30 overflow-hidden">
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Badge className="bg-green-600 text-white text-xs">
                Sponsored Post
              </Badge>
              <span className="text-gray-400 text-sm">{ad.advertiser_name}</span>
            </div>
            
            <h4 className="text-white font-semibold text-lg mb-2">{ad.title}</h4>
            
            {ad.image_url && (
              <div className="mb-3">
                <img 
                  src={ad.image_url} 
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            
            {ad.description && (
              <p className="text-gray-300 text-sm mb-3">{ad.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              {ad.click_url && (
                <Button
                  variant="outline"
                  onClick={handleClick}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Check it out
                </Button>
              )}
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{ad.impressions_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default fallback
  return null;
};

export default SponsoredAd;

