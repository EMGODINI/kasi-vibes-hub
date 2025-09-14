-- Create function to increment reel likes
CREATE OR REPLACE FUNCTION public.increment_reel_likes(reel_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reels 
  SET likes_count = likes_count + 1 
  WHERE id = reel_id AND is_active = true;
END;
$$;