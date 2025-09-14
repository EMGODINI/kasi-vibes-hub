-- Create trick_videos table
CREATE TABLE trick_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  trick_name VARCHAR(255),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  page_slug TEXT DEFAULT 'skaters-street'
);

-- Enable Row Level Security (RLS) for trick_videos table
ALTER TABLE trick_videos ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all trick videos
CREATE POLICY "Users can view all trick videos" ON trick_videos
  FOR SELECT USING (TRUE);

-- Policy for users to create trick videos
CREATE POLICY "Users can create trick videos" ON trick_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own trick videos
CREATE POLICY "Users can update their own trick videos" ON trick_videos
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own trick videos
CREATE POLICY "Users can delete their own trick videos" ON trick_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create trick_video_likes table
CREATE TABLE trick_video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  video_id UUID REFERENCES trick_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (video_id, user_id)
);

-- Enable RLS for trick_video_likes table
ALTER TABLE trick_video_likes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all trick video likes
CREATE POLICY "Users can view all trick video likes" ON trick_video_likes
  FOR SELECT USING (TRUE);

-- Policy for users to create trick video likes
CREATE POLICY "Users can create trick video likes" ON trick_video_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete trick video likes
CREATE POLICY "Users can delete trick video likes" ON trick_video_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update trick_videos likes_count
CREATE OR REPLACE FUNCTION update_trick_video_likes_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trick_videos
    SET likes_count = likes_count + 1
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE trick_videos
    SET likes_count = likes_count - 1
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trick_video_likes inserts/deletes
CREATE TRIGGER trick_video_likes_count_trigger
AFTER INSERT OR DELETE ON trick_video_likes
FOR EACH ROW EXECUTE FUNCTION update_trick_video_likes_count();

-- Create trick_video_comments table
CREATE TABLE trick_video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  video_id UUID REFERENCES trick_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for trick_video_comments table
ALTER TABLE trick_video_comments ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all trick video comments
CREATE POLICY "Users can view all trick video comments" ON trick_video_comments
  FOR SELECT USING (TRUE);

-- Policy for users to create trick video comments
CREATE POLICY "Users can create trick video comments" ON trick_video_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own trick video comments
CREATE POLICY "Users can update their own trick video comments" ON trick_video_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own trick video comments
CREATE POLICY "Users can delete their own trick video comments" ON trick_video_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update trick_videos comments_count
CREATE OR REPLACE FUNCTION update_trick_video_comments_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trick_videos
    SET comments_count = comments_count + 1
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE trick_videos
    SET comments_count = comments_count - 1
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trick_video_comments inserts/deletes
CREATE TRIGGER trick_video_comments_count_trigger
AFTER INSERT OR DELETE ON trick_video_comments
FOR EACH ROW EXECUTE FUNCTION update_trick_video_comments_count();


