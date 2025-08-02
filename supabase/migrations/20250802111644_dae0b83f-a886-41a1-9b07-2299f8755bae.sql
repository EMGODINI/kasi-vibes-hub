-- Create page_playlists table for managing playlists per page
CREATE TABLE public.page_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL, -- 'skaters-street' or 'stance' etc.
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create playlist_tracks table for individual tracks in playlists
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.page_playlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration_seconds INTEGER,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.page_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_playlists
CREATE POLICY "Anyone can view active playlists"
ON public.page_playlists
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all playlists"
ON public.page_playlists
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for playlist_tracks
CREATE POLICY "Anyone can view active tracks"
ON public.playlist_tracks
FOR SELECT
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.page_playlists 
  WHERE id = playlist_tracks.playlist_id AND is_active = true
));

CREATE POLICY "Admins can manage all tracks"
ON public.playlist_tracks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_page_playlists_page_slug ON public.page_playlists(page_slug);
CREATE INDEX idx_page_playlists_active ON public.page_playlists(is_active, order_index);
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_active ON public.playlist_tracks(is_active, order_index);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_playlists_updated_at
BEFORE UPDATE ON public.page_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlist_tracks_updated_at
BEFORE UPDATE ON public.playlist_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample playlists for both pages
INSERT INTO public.page_playlists (page_slug, title, description, created_by) VALUES
('skaters-street', 'Skaters Street Mix', 'Ultimate skating vibes playlist', (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)),
('stance', 'Stance Sessions', 'Chill vibes for your stance sessions', (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1));