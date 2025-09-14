-- Create commute_alerts table
CREATE TABLE public.commute_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  alert_type TEXT CHECK (alert_type IN (
    'traffic_jam', 'accident', 'road_closure', 'public_transport_delay', 
    'public_transport_breakdown', 'protest', 'weather_hazard', 'other'
  )) NOT NULL,
  location_name TEXT, -- e.g., 



  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )) DEFAULT 'medium',
  status TEXT CHECK (status IN (
    'active', 'resolved', 'expired'
  )) DEFAULT 'active',
  valid_until TIMESTAMP WITH TIME ZONE, -- When the alert is no longer valid
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create commute_alert_likes table
CREATE TABLE public.commute_alert_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.commute_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(alert_id, user_id)
);

-- Create commute_alert_comments table
CREATE TABLE public.commute_alert_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.commute_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commute_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_alert_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_alert_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commute_alerts
CREATE POLICY "Anyone can view active commute alerts"
ON public.commute_alerts
FOR SELECT
USING (is_active = true AND status = 'active' AND (valid_until IS NULL OR valid_until >= now()));

CREATE POLICY "Authenticated users can create commute alerts"
ON public.commute_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commute alerts"
ON public.commute_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commute alerts"
ON public.commute_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for commute_alert_likes
CREATE POLICY "Anyone can view alert likes"
ON public.commute_alert_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like alerts"
ON public.commute_alert_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own alert likes"
ON public.commute_alert_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for commute_alert_comments
CREATE POLICY "Anyone can view active alert comments"
ON public.commute_alert_comments
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create alert comments"
ON public.commute_alert_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert comments"
ON public.commute_alert_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert comments"
ON public.commute_alert_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_commute_alerts_user_id ON public.commute_alerts(user_id);
CREATE INDEX idx_commute_alerts_type ON public.commute_alerts(alert_type);
CREATE INDEX idx_commute_alerts_location ON public.commute_alerts(location_name);
CREATE INDEX idx_commute_alerts_status ON public.commute_alerts(status);
CREATE INDEX idx_commute_alerts_valid_until ON public.commute_alerts(valid_until);
CREATE INDEX idx_commute_alerts_created_at ON public.commute_alerts(created_at DESC);
CREATE INDEX idx_commute_alert_likes_alert_id ON public.commute_alert_likes(alert_id);
CREATE INDEX idx_commute_alert_comments_alert_id ON public.commute_alert_comments(alert_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_commute_alerts_updated_at
BEFORE UPDATE ON public.commute_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commute_alert_comments_updated_at
BEFORE UPDATE ON public.commute_alert_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION public.update_commute_alert_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.commute_alerts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.alert_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.commute_alerts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.alert_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_commute_alert_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.commute_alerts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.alert_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.commute_alerts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.alert_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER trigger_update_commute_alert_likes_count
AFTER INSERT OR DELETE ON public.commute_alert_likes
FOR EACH ROW EXECUTE FUNCTION public.update_commute_alert_likes_count();

CREATE TRIGGER trigger_update_commute_alert_comments_count
AFTER INSERT OR DELETE ON public.commute_alert_comments
FOR EACH ROW EXECUTE FUNCTION public.update_commute_alert_comments_count();

