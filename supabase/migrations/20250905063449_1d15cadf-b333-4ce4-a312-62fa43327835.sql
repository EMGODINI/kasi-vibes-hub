-- Move posts from "Azishe Ngama 2" page to roll_up_posts table
INSERT INTO roll_up_posts (id, user_id, image_url, caption, vibe_tags, likes_count, comments_count, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  created_by as user_id,
  image_url,
  COALESCE(content, title) as caption,
  ARRAY['cannabis', 'community']::text[] as vibe_tags,
  likes_count,
  comments_count,
  created_at,
  updated_at
FROM page_posts 
WHERE page_id = '8295fa84-b250-42fa-aae3-5dee945091ab';

-- Deactivate the "Azishe Ngama 2" page
UPDATE app_pages 
SET is_active = false, updated_at = now() 
WHERE id = '8295fa84-b250-42fa-aae3-5dee945091ab';

-- Delete the posts from page_posts since they're now in roll_up_posts
DELETE FROM page_posts 
WHERE page_id = '8295fa84-b250-42fa-aae3-5dee945091ab';