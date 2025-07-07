import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface ReelUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export default function ReelUploadModal({ open, onClose, onUploaded }: ReelUploadModalProps) {
  const { user } = useAuth();
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!video || !caption) {
      setError('Video and caption are required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      // Upload video
      const videoExt = video.name.split('.').pop();
      const videoPath = `reels/${user.id}/${Date.now()}.${videoExt}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('reels')
        .upload(videoPath, video);
      if (videoError) throw videoError;

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbPath = `reels/${user.id}/thumbnails/${Date.now()}.${thumbExt}`;
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('reels')
          .upload(thumbPath, thumbnail);
        if (thumbError) throw thumbError;
        thumbnailUrl = supabase.storage.from('reels').getPublicUrl(thumbPath).data.publicUrl;
      }

      const videoUrl = supabase.storage.from('reels').getPublicUrl(videoPath).data.publicUrl;

      // Save metadata to DB
      const { error: dbError } = await supabase
        .from('page_posts')
        .insert([{
          title: caption,
          post_type: 'video',
          image_url: thumbnailUrl || '',
          video_url: videoUrl,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }]);
      if (dbError) throw dbError;

      setUploading(false);
      onUploaded();
      onClose();
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Upload failed.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Reel</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Input
            type="file"
            accept="video/*"
            onChange={e => setVideo(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files?.[0] || null)}
            disabled={uploading}
            placeholder="(Optional) Thumbnail"
          />
          <Input
            type="text"
            placeholder="Caption"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            disabled={uploading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
