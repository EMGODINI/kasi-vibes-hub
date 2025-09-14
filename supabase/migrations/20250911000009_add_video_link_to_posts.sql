-- Add video_url and external_link columns to the posts table
ALTER TABLE posts
ADD COLUMN video_url TEXT,
ADD COLUMN external_link TEXT;

-- Optional: Add RLS policies if needed, but posts table already has RLS
-- and these columns will be covered by existing policies.


