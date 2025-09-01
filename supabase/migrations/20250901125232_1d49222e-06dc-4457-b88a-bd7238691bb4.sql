-- Insert default playlists for RollUp and SkatersStreet pages
INSERT INTO page_playlists (page_slug, title, description, cover_image_url, created_by, order_index) VALUES
('roll-up', 'Roll Up Sessions', 'Chill vibes and laid-back beats for the ultimate Roll Up experience', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', (SELECT auth.uid()), 0),
('skaters-street', 'Skaters Street Soundscape', 'Urban beats and street rhythms for the skateboarding community', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop', (SELECT auth.uid()), 0);

-- Get the playlist IDs for inserting tracks 
DO $$
DECLARE
    rollup_playlist_id UUID;
    skaters_playlist_id UUID;
BEGIN
    -- Get playlist IDs
    SELECT id INTO rollup_playlist_id FROM page_playlists WHERE page_slug = 'roll-up' AND title = 'Roll Up Sessions' LIMIT 1;
    SELECT id INTO skaters_playlist_id FROM page_playlists WHERE page_slug = 'skaters-street' AND title = 'Skaters Street Soundscape' LIMIT 1;
    
    -- Insert tracks for Roll Up playlist
    IF rollup_playlist_id IS NOT NULL THEN
        INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) VALUES
        (rollup_playlist_id, 'Chill Vibes', 'Lo-Fi Collective', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 0, (SELECT auth.uid())),
        (rollup_playlist_id, 'Mellow Moments', 'Dreamy Beats', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 1, (SELECT auth.uid()));
    END IF;
    
    -- Insert tracks for Skaters Street playlist
    IF skaters_playlist_id IS NOT NULL THEN
        INSERT INTO playlist_tracks (playlist_id, title, artist, audio_url, cover_image_url, order_index, created_by) VALUES
        (skaters_playlist_id, 'Street Rhythm', 'Urban Flow', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop', 0, (SELECT auth.uid())),
        (skaters_playlist_id, 'Concrete Waves', 'Skate Collective', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop', 1, (SELECT auth.uid()));
    END IF;
END $$;