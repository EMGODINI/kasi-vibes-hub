-- Enhance the existing sponsored_ads table with additional fields for promoted content
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS promotion_type VARCHAR(50) DEFAULT 'sponsored_ad'; -- 'sponsored_ad', 'promoted_post', 'featured_content'
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS boost_level INTEGER DEFAULT 1; -- 1-5 boost levels
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS budget_daily NUMERIC(10,2);
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS budget_total NUMERIC(10,2);
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS spent_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS target_demographics JSONB; -- Age, location, interests targeting
ALTER TABLE sponsored_ads ADD COLUMN IF NOT EXISTS performance_metrics JSONB; -- CTR, conversion rate, etc.

-- Create promoted_posts table for native promoted content
CREATE TABLE promoted_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  promotion_type VARCHAR(50) DEFAULT 'boost', -- 'boost', 'feature', 'highlight'
  target_pages TEXT[], -- Array of page slugs to promote on
  boost_level INTEGER DEFAULT 1, -- 1-5 levels
  budget_amount NUMERIC(10,2) NOT NULL,
  spent_amount NUMERIC(10,2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  target_demographics JSONB,
  performance_data JSONB
);

-- Enable RLS for promoted_posts table
ALTER TABLE promoted_posts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view promoted posts (for display)
CREATE POLICY "Users can view active promoted posts" ON promoted_posts
  FOR SELECT USING (status = 'active' AND (end_date IS NULL OR end_date > now()));

-- Policy for users to manage their own promoted posts
CREATE POLICY "Users can manage their own promoted posts" ON promoted_posts
  FOR ALL USING (auth.uid() = user_id);

-- Create promotion_campaigns table for managing advertising campaigns
CREATE TABLE promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- 'post_boost', 'profile_promotion', 'event_promotion'
  target_pages TEXT[], -- Array of page slugs
  budget_daily NUMERIC(10,2),
  budget_total NUMERIC(10,2) NOT NULL,
  spent_amount NUMERIC(10,2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'cancelled'
  target_demographics JSONB,
  objectives JSONB, -- Campaign objectives like 'reach', 'engagement', 'conversions'
  performance_summary JSONB
);

-- Enable RLS for promotion_campaigns table
ALTER TABLE promotion_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own campaigns
CREATE POLICY "Users can manage their own campaigns" ON promotion_campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Create campaign_content table to link campaigns with content
CREATE TABLE campaign_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  campaign_id UUID REFERENCES promotion_campaigns(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'post', 'profile', 'event', 'ad'
  content_id UUID NOT NULL, -- References posts.id, profiles.id, gigs.id, etc.
  boost_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for campaign_content table
ALTER TABLE campaign_content ENABLE ROW LEVEL SECURITY;

-- Policy for users to view campaign content
CREATE POLICY "Users can view campaign content" ON campaign_content
  FOR SELECT USING (TRUE);

-- Policy for users to manage their own campaign content
CREATE POLICY "Users can manage their own campaign content" ON campaign_content
  FOR ALL USING (EXISTS (SELECT 1 FROM promotion_campaigns WHERE id = campaign_id AND user_id = auth.uid()));

-- Create promotion_analytics table for detailed tracking
CREATE TABLE promotion_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  promotion_id UUID, -- Can reference promoted_posts.id or promotion_campaigns.id
  promotion_type VARCHAR(50) NOT NULL, -- 'promoted_post', 'campaign', 'sponsored_ad'
  metric_type VARCHAR(100) NOT NULL, -- 'impressions', 'clicks', 'engagements', 'conversions'
  metric_value NUMERIC(15,4) NOT NULL,
  cost_per_metric NUMERIC(10,4),
  page_slug VARCHAR(100), -- Which page the metric occurred on
  user_demographics JSONB, -- Demographics of users who interacted
  timestamp_hour TIMESTAMP WITH TIME ZONE NOT NULL -- Hourly aggregation
);

-- Enable RLS for promotion_analytics table
ALTER TABLE promotion_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for users to view analytics for their own promotions
CREATE POLICY "Users can view their own promotion analytics" ON promotion_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM promoted_posts pp WHERE pp.id = promotion_id AND pp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM promotion_campaigns pc WHERE pc.id = promotion_id AND pc.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM sponsored_ads sa WHERE sa.id = promotion_id AND sa.advertiser_id = auth.uid()
    )
  );

-- Function to update promoted_posts updated_at timestamp
CREATE OR REPLACE FUNCTION update_promoted_posts_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update promotion_campaigns updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotion_campaigns_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER promoted_posts_updated_at_trigger
BEFORE UPDATE ON promoted_posts
FOR EACH ROW EXECUTE FUNCTION update_promoted_posts_updated_at();

CREATE TRIGGER promotion_campaigns_updated_at_trigger
BEFORE UPDATE ON promotion_campaigns
FOR EACH ROW EXECUTE FUNCTION update_promotion_campaigns_updated_at();

-- Function to get promoted content for a specific page
CREATE OR REPLACE FUNCTION get_promoted_content_for_page(page_name TEXT, content_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  content_id UUID,
  content_type VARCHAR(50),
  boost_level INTEGER,
  promotion_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.content_id,
    cc.content_type,
    cc.boost_level,
    pc.campaign_type as promotion_type,
    cc.created_at
  FROM campaign_content cc
  JOIN promotion_campaigns pc ON cc.campaign_id = pc.id
  WHERE pc.status = 'active'
    AND (pc.end_date IS NULL OR pc.end_date > now())
    AND page_name = ANY(pc.target_pages)
    AND cc.is_active = TRUE
  
  UNION ALL
  
  SELECT 
    pp.post_id as content_id,
    'post' as content_type,
    pp.boost_level,
    pp.promotion_type,
    pp.created_at
  FROM promoted_posts pp
  WHERE pp.status = 'active'
    AND (pp.end_date IS NULL OR pp.end_date > now())
    AND page_name = ANY(pp.target_pages)
  
  ORDER BY boost_level DESC, created_at DESC
  LIMIT content_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track promotion interaction
CREATE OR REPLACE FUNCTION track_promotion_interaction(
  promo_id UUID,
  promo_type VARCHAR(50),
  interaction_type VARCHAR(100),
  page_name VARCHAR(100) DEFAULT NULL,
  user_demo JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO promotion_analytics (
    promotion_id,
    promotion_type,
    metric_type,
    metric_value,
    page_slug,
    user_demographics,
    timestamp_hour
  ) VALUES (
    promo_id,
    promo_type,
    interaction_type,
    1,
    page_name,
    user_demo,
    date_trunc('hour', now())
  )
  ON CONFLICT (promotion_id, promotion_type, metric_type, timestamp_hour)
  DO UPDATE SET metric_value = promotion_analytics.metric_value + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_promoted_posts_status_dates ON promoted_posts(status, start_date, end_date);
CREATE INDEX idx_promoted_posts_target_pages ON promoted_posts USING GIN(target_pages);
CREATE INDEX idx_promotion_campaigns_status_dates ON promotion_campaigns(status, start_date, end_date);
CREATE INDEX idx_promotion_campaigns_target_pages ON promotion_campaigns USING GIN(target_pages);
CREATE INDEX idx_campaign_content_campaign_active ON campaign_content(campaign_id, is_active);
CREATE INDEX idx_promotion_analytics_promotion_type ON promotion_analytics(promotion_id, promotion_type);
CREATE INDEX idx_promotion_analytics_timestamp ON promotion_analytics(timestamp_hour);

-- Insert sample promotion campaigns for demonstration
INSERT INTO promotion_campaigns (user_id, campaign_name, description, campaign_type, target_pages, budget_total, objectives) 
SELECT 
  p.id,
  'Welcome Campaign',
  'Promote community engagement and new user onboarding',
  'profile_promotion',
  ARRAY['dashboard', 'skaters-street', 'groovist'],
  500.00,
  '{"primary": "reach", "secondary": "engagement"}'::jsonb
FROM profiles p 
WHERE p.username = 'admin' 
LIMIT 1;

