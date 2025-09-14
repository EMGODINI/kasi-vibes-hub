-- Create gigs table for Groovist community
CREATE TABLE public.gigs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  artist_name TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  ticket_price DECIMAL(10, 2), -- Price in local currency
  ticket_url TEXT, -- External ticketing link
  contact_info TEXT, -- Phone/email for bookings
  image_url TEXT,
  genre TEXT, -- Music genre
  event_type TEXT CHECK (event_type IN ('concert', 'dj_set', 'open_mic', 'festival', 'club_night', 'private_party', 'other')) DEFAULT 'concert',
  capacity INTEGER, -- Expected attendance
  age_restriction TEXT CHECK (age_restriction IN ('all_ages', '18+', '21+')) DEFAULT 'all_ages',
  is_free BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, -- For promoted/sponsored gigs
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0, -- People who marked "interested"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gig_likes table
CREATE TABLE public.gig_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

-- Create gig_interested table (for "I'm interested" feature)
CREATE TABLE public.gig_interested (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

-- Create gig_comments table
CREATE TABLE public.gig_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsored_ads table for advertising system
CREATE TABLE public.sponsored_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  click_url TEXT, -- Where the ad links to
  ad_type TEXT CHECK (ad_type IN ('banner', 'card', 'sponsored_post', 'video')) DEFAULT 'banner',
  target_pages TEXT[], -- Array of page slugs where ad should show
  target_demographics JSONB, -- Age, location, interests etc.
  budget_total DECIMAL(10, 2), -- Total ad budget
  budget_spent DECIMAL(10, 2) DEFAULT 0,
  cost_per_click DECIMAL(10, 4) DEFAULT 0, -- CPC pricing
  cost_per_impression DECIMAL(10, 4) DEFAULT 0, -- CPM pricing
  clicks_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false, -- Admin approval required
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_interactions table for tracking
CREATE TABLE public.ad_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.sponsored_ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for anonymous users
  interaction_type TEXT CHECK (interaction_type IN ('view', 'click')) NOT NULL,
  page_slug TEXT, -- Where the interaction happened
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_interested ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gigs
CREATE POLICY "Anyone can view active gigs"
ON public.gigs
FOR SELECT
USING (is_active = true AND status != 'cancelled');

CREATE POLICY "Authenticated users can create gigs"
ON public.gigs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gigs"
ON public.gigs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gigs"
ON public.gigs
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gig_likes
CREATE POLICY "Anyone can view gig likes"
ON public.gig_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like gigs"
ON public.gig_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.gig_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gig_interested
CREATE POLICY "Anyone can view gig interested"
ON public.gig_interested
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can mark interested"
ON public.gig_interested
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark their own interest"
ON public.gig_interested
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gig_comments
CREATE POLICY "Anyone can view active gig comments"
ON public.gig_comments
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create gig comments"
ON public.gig_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gig comments"
ON public.gig_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gig comments"
ON public.gig_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for sponsored_ads (admin-only for now)
CREATE POLICY "Anyone can view active approved ads"
ON public.sponsored_ads
FOR SELECT
USING (is_active = true AND is_approved = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- RLS Policies for ad_interactions
CREATE POLICY "Anyone can create ad interactions"
ON public.ad_interactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own ad interactions"
ON public.ad_interactions
FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_gigs_user_id ON public.gigs(user_id);
CREATE INDEX idx_gigs_event_date ON public.gigs(event_date);
CREATE INDEX idx_gigs_venue ON public.gigs(venue_name);
CREATE INDEX idx_gigs_genre ON public.gigs(genre);
CREATE INDEX idx_gigs_event_type ON public.gigs(event_type);
CREATE INDEX idx_gigs_status ON public.gigs(status);
CREATE INDEX idx_gigs_featured ON public.gigs(is_featured);
CREATE INDEX idx_gigs_active ON public.gigs(is_active);
CREATE INDEX idx_gigs_created_at ON public.gigs(created_at DESC);

CREATE INDEX idx_gig_likes_gig_id ON public.gig_likes(gig_id);
CREATE INDEX idx_gig_interested_gig_id ON public.gig_interested(gig_id);
CREATE INDEX idx_gig_comments_gig_id ON public.gig_comments(gig_id);

CREATE INDEX idx_sponsored_ads_active ON public.sponsored_ads(is_active, is_approved);
CREATE INDEX idx_sponsored_ads_dates ON public.sponsored_ads(start_date, end_date);
CREATE INDEX idx_sponsored_ads_target_pages ON public.sponsored_ads USING GIN(target_pages);

CREATE INDEX idx_ad_interactions_ad_id ON public.ad_interactions(ad_id);
CREATE INDEX idx_ad_interactions_type ON public.ad_interactions(interaction_type);
CREATE INDEX idx_ad_interactions_created_at ON public.ad_interactions(created_at);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_gigs_updated_at
BEFORE UPDATE ON public.gigs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gig_comments_updated_at
BEFORE UPDATE ON public.gig_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsored_ads_updated_at
BEFORE UPDATE ON public.sponsored_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION public.update_gig_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gigs 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.gig_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gigs 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.gig_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_gig_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gigs 
    SET interested_count = interested_count + 1 
    WHERE id = NEW.gig_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gigs 
    SET interested_count = interested_count - 1 
    WHERE id = OLD.gig_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_gig_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gigs 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.gig_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gigs 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.gig_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update ad interaction counts
CREATE OR REPLACE FUNCTION public.update_ad_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'click' THEN
    UPDATE public.sponsored_ads 
    SET clicks_count = clicks_count + 1 
    WHERE id = NEW.ad_id;
  ELSIF NEW.interaction_type = 'view' THEN
    UPDATE public.sponsored_ads 
    SET impressions_count = impressions_count + 1 
    WHERE id = NEW.ad_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER trigger_update_gig_likes_count
AFTER INSERT OR DELETE ON public.gig_likes
FOR EACH ROW EXECUTE FUNCTION public.update_gig_likes_count();

CREATE TRIGGER trigger_update_gig_interested_count
AFTER INSERT OR DELETE ON public.gig_interested
FOR EACH ROW EXECUTE FUNCTION public.update_gig_interested_count();

CREATE TRIGGER trigger_update_gig_comments_count
AFTER INSERT OR DELETE ON public.gig_comments
FOR EACH ROW EXECUTE FUNCTION public.update_gig_comments_count();

CREATE TRIGGER trigger_update_ad_interaction_counts
AFTER INSERT ON public.ad_interactions
FOR EACH ROW EXECUTE FUNCTION public.update_ad_interaction_counts();

