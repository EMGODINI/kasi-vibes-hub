
-- Create a table for managing app pages
CREATE TABLE IF NOT EXISTS public.app_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create a table for page posts/content
CREATE TABLE IF NOT EXISTS public.page_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.app_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  post_type TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create a table for post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.page_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.app_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_pages
CREATE POLICY "Anyone can view active pages" ON public.app_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all pages" ON public.app_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for page_posts
CREATE POLICY "Anyone can view posts" ON public.page_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.page_posts
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own posts" ON public.page_posts
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all posts" ON public.page_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view comments" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = created_by);

-- Insert default pages
INSERT INTO public.app_pages (name, slug, title, description, order_index) VALUES
  ('Dashboard', 'dashboard', 'Dashboard', 'Main dashboard with all content', 1),
  ('Siya Pheka', 'siya-pheka', 'Siya Pheka', 'Music and beats content', 2),
  ('Podcast', 'podcast', 'Podcast', 'Podcast episodes and discussions', 3),
  ('Die Stance', 'die-stance', 'Die Stance', 'Car stance and automotive content', 4),
  ('Umgosi', 'umgosi', 'Umgosi', 'Community gossip and discussions', 5),
  ('Stoko', 'stoko', 'Stoko', 'Photography and visual content', 6),
  ('Hustlers Nje', 'hustlers', 'Hustlers Nje', 'Business and entrepreneurship', 7),
  ('Styla Samahala', 'styla', 'Styla Samahala', 'Fashion and style content', 8),
  ('Umdantso Kuphela', 'umdantso', 'Umdantso Kuphela', 'Dance and entertainment', 9)
ON CONFLICT (slug) DO NOTHING;

-- Create storage bucket for page assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('page-assets', 'page-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for page-assets bucket
CREATE POLICY "Page assets are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'page-assets');

CREATE POLICY "Authenticated users can upload page assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'page-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (bucket_id = 'page-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete page assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'page-assets' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
