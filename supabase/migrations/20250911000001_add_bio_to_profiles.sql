-- Add bio field to profiles table
ALTER TABLE public.profiles ADD COLUMN bio TEXT;

-- Add index for better performance if needed
CREATE INDEX IF NOT EXISTS idx_profiles_bio ON public.profiles(bio) WHERE bio IS NOT NULL;

