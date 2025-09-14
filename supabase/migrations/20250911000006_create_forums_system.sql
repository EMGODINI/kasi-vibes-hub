-- Create forums table
CREATE TABLE public.forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  page_slug TEXT, -- The page this forum belongs to (e.g., 'roll-up', 'stance')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table (for replies to topics)
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_topic_likes table
CREATE TABLE public.forum_topic_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Create forum_post_likes table
CREATE TABLE public.forum_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forums
CREATE POLICY "Anyone can view active forums"
ON public.forums
FOR SELECT
USING (is_active = true);

-- RLS Policies for forum_topics
CREATE POLICY "Anyone can view active forum topics"
ON public.forum_topics
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create forum topics"
ON public.forum_topics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum topics"
ON public.forum_topics
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum topics"
ON public.forum_topics
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view active forum posts"
ON public.forum_posts
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create forum posts"
ON public.forum_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forum posts"
ON public.forum_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum posts"
ON public.forum_posts
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for forum_topic_likes
CREATE POLICY "Anyone can view topic likes"
ON public.forum_topic_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like topics"
ON public.forum_topic_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own topic likes"
ON public.forum_topic_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for forum_post_likes
CREATE POLICY "Anyone can view post likes"
ON public.forum_post_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like posts"
ON public.forum_post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own post likes"
ON public.forum_post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_forums_slug ON public.forums(slug);
CREATE INDEX idx_forums_page_slug ON public.forums(page_slug);

CREATE INDEX idx_forum_topics_forum_id ON public.forum_topics(forum_id);
CREATE INDEX idx_forum_topics_user_id ON public.forum_topics(user_id);
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_topics_pinned ON public.forum_topics(is_pinned DESC);

CREATE INDEX idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

CREATE INDEX idx_forum_topic_likes_topic_id ON public.forum_topic_likes(topic_id);
CREATE INDEX idx_forum_post_likes_post_id ON public.forum_post_likes(post_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_forums_updated_at
BEFORE UPDATE ON public.forums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
BEFORE UPDATE ON public.forum_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions to update counts
CREATE OR REPLACE FUNCTION public.update_forum_topic_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_forum_topic_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER trigger_update_forum_topic_likes_count
AFTER INSERT OR DELETE ON public.forum_topic_likes
FOR EACH ROW EXECUTE FUNCTION public.update_forum_topic_likes_count();

CREATE TRIGGER trigger_update_forum_topic_comments_count
AFTER INSERT OR DELETE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.update_forum_topic_comments_count();
();

