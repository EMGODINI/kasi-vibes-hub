-- Create artist_profiles table
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_name VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  bio TEXT,
  profile_picture_url TEXT,
  cover_image_url TEXT,
  social_links JSONB, -- e.g., { "instagram": "url", "youtube": "url" }
  contact_email VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id)
);

-- Enable Row Level Security (RLS) for artist_profiles table
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all artist profiles
CREATE POLICY "Users can view all artist profiles" ON artist_profiles
  FOR SELECT USING (TRUE);

-- Policy for users to create their own artist profile
CREATE POLICY "Users can create their own artist profile" ON artist_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own artist profile
CREATE POLICY "Users can update their own artist profile" ON artist_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own artist profile
CREATE POLICY "Users can delete their own artist profile" ON artist_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create artist_media table (for music, videos, etc.)
CREATE TABLE artist_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL, -- e.g., audio, video, image
  url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Enable RLS for artist_media table
ALTER TABLE artist_media ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all artist media
CREATE POLICY "Users can view all artist media" ON artist_media
  FOR SELECT USING (TRUE);

-- Policy for artists to create their own media
CREATE POLICY "Artists can create their own media" ON artist_media
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM artist_profiles WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for artists to update their own media
CREATE POLICY "Artists can update their own media" ON artist_media
  FOR UPDATE USING (EXISTS (SELECT 1 FROM artist_profiles WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for artists to delete their own media
CREATE POLICY "Artists can delete their own media" ON artist_media
  FOR DELETE USING (EXISTS (SELECT 1 FROM artist_profiles WHERE id = artist_id AND user_id = auth.uid()));


