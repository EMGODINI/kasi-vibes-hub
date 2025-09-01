-- Insert default playlists for RollUp and SkatersStreet pages
INSERT INTO page_playlists (page_slug, title, description, cover_image_url, created_by, order_index) VALUES
('roll-up', 'Roll Up Sessions', 'Chill vibes and laid-back beats for the ultimate Roll Up experience', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', (SELECT id FROM auth.users LIMIT 1), 0),
('skaters-street', 'Skaters Street Soundscape', 'Urban beats and street rhythms for the skateboarding community', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop', (SELECT id FROM auth.users LIMIT 1), 0)
ON CONFLICT (page_slug, title) DO NOTHING;

-- Insert sample tracks for RollUp playlist
INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) 
SELECT p.id, 'Chill Vibes', 'Lo-Fi Collective', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 0, (SELECT id FROM auth.users LIMIT 1)
FROM page_playlists p WHERE p.page_slug = 'roll-up' AND p.title = 'Roll Up Sessions'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) 
SELECT p.id, 'Mellow Moments', 'Dreamy Beats', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 1, (SELECT id FROM auth.users LIMIT 1)
FROM page_playlists p WHERE p.page_slug = 'roll-up' AND p.title = 'Roll Up Sessions'
ON CONFLICT DO NOTHING;

-- Insert sample tracks for Skaters Street playlist
INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) 
SELECT p.id, 'Street Rhythm', 'Urban Flow', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop', 0, (SELECT id FROM auth.users LIMIT 1)
FROM page_playlists p WHERE p.page_slug = 'skaters-street' AND p.title = 'Skaters Street Soundscape'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) 
SELECT p.id, 'Concrete Waves', 'Skate Collective', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop', 1, (SELECT id FROM auth.users LIMIT 1)
FROM page_playlists p WHERE p.page_slug = 'skaters-street' AND p.title = 'Skaters Street Soundscape'
ON CONFLICT DO NOTHING;