-- Create skate_spots table for Skaters Street community
CREATE TABLE public.skate_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL, -- e.g., "Downtown Cape Town", "Johannesburg CBD"
  latitude DECIMAL(10, 8), -- Optional GPS coordinates
  longitude DECIMAL(11, 8), -- Optional GPS coordinates
  image_url TEXT,
  spot_type TEXT CHECK (spot_type IN ('street', 'park', 'bowl', 'vert', 'ledge', 'rail', 'stairs', 'gap', 'other')) DEFAULT 'street',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  surface_type TEXT CHECK (surface_type IN ('concrete', 'asphalt', 'wood', 'metal', 'other')) DEFAULT 'concrete',
  is_public BOOLEAN DEFAULT true, -- Whether it's accessible to public
  is_legal BOOLEAN DEFAULT true, -- Whether skating is legal there
  rating DECIMAL(2,1) DEFAULT 0.0, -- Average rating out of 5
  ratings_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skate_spot_ratings table for user ratings
CREATE TABLE public.skate_spot_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.skate_spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(spot_id, user_id)
);

-- Create skate_spot_likes table
CREATE TABLE public.skate_spot_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.skate_spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(spot_id, user_id)
);

-- Create skate_spot_comments table
CREATE TABLE public.skate_spot_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.skate_spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skate_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skate_spot_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skate_spot_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skate_spot_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skate_spots
CREATE POLICY "Anyone can view active skate spots"
ON public.skate_spots
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create skate spots"
ON public.skate_spots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skate spots"
ON public.skate_spots
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skate spots"
ON public.skate_spots
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for skate_spot_ratings
CREATE POLICY "Anyone can view ratings"
ON public.skate_spot_ratings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can rate spots"
ON public.skate_spot_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.skate_spot_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.skate_spot_ratings
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for skate_spot_likes
CREATE POLICY "Anyone can view likes"
ON public.skate_spot_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like spots"
ON public.skate_spot_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.skate_spot_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for skate_spot_comments
CREATE POLICY "Anyone can view active comments"
ON public.skate_spot_comments
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create comments"
ON public.skate_spot_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.skate_spot_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.skate_spot_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_skate_spots_user_id ON public.skate_spots(user_id);
CREATE INDEX idx_skate_spots_location ON public.skate_spots(location_name);
CREATE INDEX idx_skate_spots_type ON public.skate_spots(spot_type);
CREATE INDEX idx_skate_spots_difficulty ON public.skate_spots(difficulty_level);
CREATE INDEX idx_skate_spots_rating ON public.skate_spots(rating DESC);
CREATE INDEX idx_skate_spots_created_at ON public.skate_spots(created_at DESC);
CREATE INDEX idx_skate_spots_active ON public.skate_spots(is_active);
CREATE INDEX idx_skate_spot_ratings_spot_id ON public.skate_spot_ratings(spot_id);
CREATE INDEX idx_skate_spot_likes_spot_id ON public.skate_spot_likes(spot_id);
CREATE INDEX idx_skate_spot_comments_spot_id ON public.skate_spot_comments(spot_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_skate_spots_updated_at
BEFORE UPDATE ON public.skate_spots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skate_spot_comments_updated_at
BEFORE UPDATE ON public.skate_spot_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION public.update_skate_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.skate_spots 
    SET 
      rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0.0) 
        FROM public.skate_spot_ratings 
        WHERE spot_id = NEW.spot_id
      ),
      ratings_count = (
        SELECT COUNT(*) 
        FROM public.skate_spot_ratings 
        WHERE spot_id = NEW.spot_id
      )
    WHERE id = NEW.spot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skate_spots 
    SET 
      rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0.0) 
        FROM public.skate_spot_ratings 
        WHERE spot_id = OLD.spot_id
      ),
      ratings_count = (
        SELECT COUNT(*) 
        FROM public.skate_spot_ratings 
        WHERE spot_id = OLD.spot_id
      )
    WHERE id = OLD.spot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_skate_spot_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skate_spots 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.spot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skate_spots 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.spot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_skate_spot_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skate_spots 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.spot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skate_spots 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.spot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER trigger_update_skate_spot_rating
AFTER INSERT OR UPDATE OR DELETE ON public.skate_spot_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_skate_spot_rating();

CREATE TRIGGER trigger_update_skate_spot_likes_count
AFTER INSERT OR DELETE ON public.skate_spot_likes
FOR EACH ROW EXECUTE FUNCTION public.update_skate_spot_likes_count();

CREATE TRIGGER trigger_update_skate_spot_comments_count
AFTER INSERT OR DELETE ON public.skate_spot_comments
FOR EACH ROW EXECUTE FUNCTION public.update_skate_spot_comments_count();

