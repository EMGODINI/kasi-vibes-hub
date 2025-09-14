-- Create daily content table for rotating content
CREATE TABLE public.daily_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('meme', 'quote', 'playlist', 'video', 'fun_fact')),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create user uploads table for joint/spliff setups
CREATE TABLE public.roll_up_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  vibe_tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user points and badges system
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER DEFAULT 0,
  level_name TEXT DEFAULT 'Roll Up Rookie',
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments for roll up posts
CREATE TABLE public.roll_up_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.roll_up_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes for roll up posts
CREATE TABLE public.roll_up_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.roll_up_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_up_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_up_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_up_likes ENABLE ROW LEVEL SECURITY;

-- Policies for daily_content
CREATE POLICY "Anyone can view active daily content" ON public.daily_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage daily content" ON public.daily_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for roll_up_posts
CREATE POLICY "Anyone can view roll up posts" ON public.roll_up_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.roll_up_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.roll_up_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.roll_up_posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_points
CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all points" ON public.user_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can update points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update user points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

-- Policies for roll_up_comments
CREATE POLICY "Anyone can view comments" ON public.roll_up_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.roll_up_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.roll_up_comments FOR UPDATE USING (auth.uid() = user_id);

-- Policies for roll_up_likes
CREATE POLICY "Anyone can view likes" ON public.roll_up_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.roll_up_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.roll_up_likes FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_daily_content_updated_at
  BEFORE UPDATE ON public.daily_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roll_up_posts_updated_at
  BEFORE UPDATE ON public.roll_up_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();