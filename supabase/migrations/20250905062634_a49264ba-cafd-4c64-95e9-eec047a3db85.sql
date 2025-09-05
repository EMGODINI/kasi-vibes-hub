-- Add foreign key constraint between reels and profiles
ALTER TABLE public.reels 
ADD CONSTRAINT reels_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;