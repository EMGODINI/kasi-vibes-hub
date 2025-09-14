
-- Create content table for admin uploads
CREATE TABLE public.content (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('hero_image', 'profile_image', 'background_image', 'general')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active content" 
  ON public.content 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage all content" 
  ON public.content 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create content storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content', 'content', true);

-- Create storage policies for content bucket
CREATE POLICY "Content is publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'content');

CREATE POLICY "Admins can upload content" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content" ON storage.objects
FOR UPDATE USING (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content" ON storage.objects
FOR DELETE USING (bucket_id = 'content' AND public.has_role(auth.uid(), 'admin'));
