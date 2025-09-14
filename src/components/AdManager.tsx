import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SponsoredAd from './SponsoredAd';

interface Ad {
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

interface AdManagerProps {
  pageSlug: string;
  adType?: 'banner' | 'card' | 'sponsored_post' | 'video';
  maxAds?: number;
  className?: string;
  showCloseButton?: boolean;
}

const AdManager = ({ 
  pageSlug, 
  adType, 
  maxAds = 1, 
  className = '',
  showCloseButton = false 
}: AdManagerProps) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [pageSlug, adType]);

  const loadAds = async () => {
    try {
      let query = supabase
        .from('sponsored_ads')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', true)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0]);

      // Filter by page slug
      query = query.contains('target_pages', [pageSlug]);

      // Filter by ad type if specified
      if (adType) {
        query = query.eq('ad_type', adType);
      }

      // Order by priority (featured first, then by budget)
      query = query.order('budget_total', { ascending: false });

      // Limit results
      query = query.limit(maxAds * 2); // Get more than needed in case some are dismissed

      const { data, error } = await query;

      if (error) throw error;

      // Filter out dismissed ads and limit to maxAds
      const filteredAds = (data || [])
        .filter(ad => !dismissedAds.has(ad.id))
        .slice(0, maxAds);

      setAds(filteredAds);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClose = (adId: string) => {
    setDismissedAds(prev => new Set([...prev, adId]));
    setAds(prev => prev.filter(ad => ad.id !== adId));
  };

  if (isLoading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad) => (
        <SponsoredAd
          key={ad.id}
          ad={ad}
          pageSlug={pageSlug}
          onClose={() => handleAdClose(ad.id)}
          showCloseButton={showCloseButton}
        />
      ))}
    </div>
  );
};

export default AdManager;

