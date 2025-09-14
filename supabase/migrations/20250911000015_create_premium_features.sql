-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  plan_name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'basic', 'premium', 'pro'
  display_name VARCHAR(100) NOT NULL, -- e.g., '3MG Premium', '3MG Pro'
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2), -- Optional yearly pricing
  features JSONB NOT NULL, -- Array of feature keys
  max_posts_per_day INTEGER,
  max_file_upload_mb INTEGER,
  max_communities INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS for subscription_plans table
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active subscription plans
CREATE POLICY "Users can view all active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50), -- 'card', 'paypal', 'bank_transfer'
  payment_reference VARCHAR(255),
  auto_renew BOOLEAN DEFAULT TRUE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- Enable RLS for user_subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create feature_usage table for tracking premium feature usage
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL, -- e.g., 'posts_created', 'file_uploaded', 'analytics_viewed'
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  metadata JSONB, -- Additional context about the usage
  UNIQUE (user_id, feature_key, usage_date)
);

-- Enable RLS for feature_usage table
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own feature usage
CREATE POLICY "Users can view their own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own feature usage
CREATE POLICY "Users can insert their own feature usage" ON feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create premium_analytics table for enhanced analytics
CREATE TABLE premium_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL, -- e.g., 'post_views', 'profile_visits', 'engagement_rate'
  metric_value NUMERIC(15,4) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB -- Additional metric details
);

-- Enable RLS for premium_analytics table
ALTER TABLE premium_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own analytics
CREATE POLICY "Users can view their own analytics" ON premium_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_name, display_name, description, price_monthly, price_yearly, features, max_posts_per_day, max_file_upload_mb, max_communities) VALUES
('free', '3MG Free', 'Basic access to all communities with standard features', 0.00, 0.00, 
 '["basic_posting", "community_access", "standard_support"]'::jsonb, 
 10, 5, 5),

('premium', '3MG Premium', 'Enhanced experience with ad-free browsing and priority support', 49.99, 499.99,
 '["ad_free", "priority_support", "enhanced_profiles", "advanced_search", "premium_badges", "extended_posting"]'::jsonb,
 50, 25, 15),

('pro', '3MG Pro', 'Professional features for content creators and community leaders', 99.99, 999.99,
 '["all_premium_features", "analytics_dashboard", "content_scheduling", "community_management", "api_access", "custom_branding", "unlimited_posting"]'::jsonb,
 -1, 100, -1);

-- Function to check if user has premium feature access
CREATE OR REPLACE FUNCTION user_has_premium_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan_features JSONB;
BEGIN
  -- Get user's current active subscription features
  SELECT sp.features INTO user_plan_features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > now())
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no active subscription, check if they have free plan access
  IF user_plan_features IS NULL THEN
    SELECT sp.features INTO user_plan_features
    FROM subscription_plans sp
    WHERE sp.plan_name = 'free';
  END IF;

  -- Check if feature is included in their plan
  RETURN user_plan_features ? feature_name OR user_plan_features ? 'all_premium_features';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription plan
CREATE OR REPLACE FUNCTION get_user_subscription_plan(user_uuid UUID)
RETURNS TABLE(
  plan_name VARCHAR(100),
  display_name VARCHAR(100),
  features JSONB,
  status VARCHAR(50),
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT sp.plan_name, sp.display_name, sp.features, us.status, us.end_date
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > now())
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no active subscription found, return free plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT sp.plan_name, sp.display_name, sp.features, 'active'::VARCHAR(50), NULL::TIMESTAMP WITH TIME ZONE
    FROM subscription_plans sp
    WHERE sp.plan_name = 'free';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(user_uuid UUID, feature_name TEXT, usage_metadata JSONB DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO feature_usage (user_id, feature_key, metadata)
  VALUES (user_uuid, feature_name, usage_metadata)
  ON CONFLICT (user_id, feature_key, usage_date)
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    metadata = COALESCE(usage_metadata, feature_usage.metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user_subscriptions updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_subscriptions updates
CREATE TRIGGER user_subscriptions_updated_at_trigger
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX idx_user_subscriptions_active ON user_subscriptions(status, end_date);
CREATE INDEX idx_feature_usage_user_date ON feature_usage(user_id, usage_date);
CREATE INDEX idx_premium_analytics_user_type ON premium_analytics(user_id, metric_type);
CREATE INDEX idx_premium_analytics_period ON premium_analytics(period_start, period_end);

