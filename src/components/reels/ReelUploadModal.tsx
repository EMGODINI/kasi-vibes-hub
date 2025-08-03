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

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= 15);
      };
      video.onerror = () => resolve(false);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!video || !caption) {
      setError('Video and caption are required.');
      return;
    }

    // Validate video duration
    const isValidDuration = await validateVideo(video);
    if (!isValidDuration) {
      setError('Video must be 15 seconds or less for KASI FLIX.');
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
          <DialogTitle>Upload to KASI FLIX</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Dance Video or Movie Clip (Max 15 seconds)
            </label>
            <Input
              type="file"
              accept="video/*"
              onChange={e => setVideo(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={e => setThumbnail(e.target.files?.[0] || null)}
            disabled={uploading}
            placeholder="(Optional) Thumbnail"
          />
          <Input
            type="text"
            placeholder="Caption (describe your dance or movie scene)"
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
