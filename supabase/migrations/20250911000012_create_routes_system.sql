-- Create routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  route_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance_km NUMERIC,
  duration_minutes INTEGER,
  route_path JSONB, -- e.g., GeoJSON or array of lat/lng points
  is_public BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Enable Row Level Security (RLS) for routes table
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all public routes
CREATE POLICY "Users can view all public routes" ON routes
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

-- Policy for users to create routes
CREATE POLICY "Users can create routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own routes
CREATE POLICY "Users can update their own routes" ON routes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own routes
CREATE POLICY "Users can delete their own routes" ON routes
  FOR DELETE USING (auth.uid() = user_id);

-- Create route_likes table
CREATE TABLE route_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (route_id, user_id)
);

-- Enable RLS for route_likes table
ALTER TABLE route_likes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all route likes
CREATE POLICY "Users can view all route likes" ON route_likes
  FOR SELECT USING (TRUE);

-- Policy for users to create route likes
CREATE POLICY "Users can create route likes" ON route_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete route likes
CREATE POLICY "Users can delete route likes" ON route_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update routes likes_count
CREATE OR REPLACE FUNCTION update_routes_likes_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE routes
    SET likes_count = likes_count + 1
    WHERE id = NEW.route_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE routes
    SET likes_count = likes_count - 1
    WHERE id = OLD.route_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for route_likes inserts/deletes
CREATE TRIGGER route_likes_count_trigger
AFTER INSERT OR DELETE ON route_likes
FOR EACH ROW EXECUTE FUNCTION update_routes_likes_count();

-- Create route_comments table
CREATE TABLE route_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

-- Enable RLS for route_comments table
ALTER TABLE route_comments ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all route comments
CREATE POLICY "Users can view all route comments" ON route_comments
  FOR SELECT USING (TRUE);

-- Policy for users to create route comments
CREATE POLICY "Users can create route comments" ON route_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own route comments
CREATE POLICY "Users can update their own route comments" ON route_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own route comments
CREATE POLICY "Users can delete their own route comments" ON route_comments
  FOR DELETE USING (auth.uid() = user_id);


-- Function to update routes comments_count
CREATE OR REPLACE FUNCTION update_routes_comments_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE routes
    SET comments_count = comments_count + 1
    WHERE id = NEW.route_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE routes
    SET comments_count = comments_count - 1
    WHERE id = OLD.route_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for route_comments inserts/deletes
CREATE TRIGGER route_comments_count_trigger
AFTER INSERT OR DELETE ON route_comments
FOR EACH ROW EXECUTE FUNCTION update_routes_comments_count();

