-- Add audio track support to app_pages table
ALTER TABLE public.app_pages 
ADD COLUMN audio_url TEXT,
ADD COLUMN audio_title TEXT,
ADD COLUMN auto_play_audio BOOLEAN DEFAULT false;

-- Create page for Azishe Ngama 2
INSERT INTO public.app_pages (name, slug, title, description, audio_title, auto_play_audio)
VALUES (
  'Azishe Ngama 2',
  'azishe-ngama-2', 
  'Azishe Ngama 2',
  'Cannabis community for sharing ideas, chatting, and posting pictures',
  'Welcome Track',
  true
);