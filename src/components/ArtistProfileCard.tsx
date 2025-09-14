import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link, Music, Instagram, Youtube, Mail, Edit, Trash } from 'lucide-react';

interface ArtistProfile {
  id: string;
  created_at: string;
  user_id: string;
  artist_name: string;
  genre?: string;
  bio?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  social_links?: { instagram?: string; youtube?: string };
  contact_email?: string;
  is_featured: boolean;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface ArtistMedia {
  id: string;
  media_type: string;
  url: string;
  title?: string;
  description?: string;
}

interface ArtistProfileCardProps {
  profile: ArtistProfile;
  onProfileUpdated?: () => void;
  onProfileDeleted?: () => void;
}

const ArtistProfileCard: React.FC<ArtistProfileCardProps> = ({ profile: artistProfile, onProfileUpdated, onProfileDeleted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<ArtistMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoadingMedia(true);
      const { data, error } = await supabase
        .from('artist_media')
        .select('*')
        .eq('artist_id', artistProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist media:', error.message);
        toast({
          title: 'Error',
          description: 'Failed to load artist media.',
          variant: 'destructive',
        });
      } else {
        setMedia(data || []);
      }
      setLoadingMedia(false);
    };

    fetchMedia();
  }, [artistProfile.id, toast]);

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete this artist profile? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('artist_profiles')
        .delete()
        .eq('id', artistProfile.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Profile Deleted',
        description: 'Artist profile has been successfully deleted.',
      });
      onProfileDeleted?.();
    } catch (error: any) {
      console.error('Error deleting profile:', error.message);
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete artist profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-4 overflow-hidden">
      {artistProfile.cover_image_url && (
        <div className="relative h-48 w-full">
          <img src={artistProfile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
        </div>
      )}
      <CardHeader className="relative flex flex-col items-center p-4 pt-0">
        <Avatar className="w-24 h-24 border-4 border-orange-500/50 -mt-12 mb-4 z-10">
          <AvatarImage src={artistProfile.profile_picture_url || '/placeholder.svg'} />
          <AvatarFallback>{artistProfile.artist_name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-white text-2xl font-bold">{artistProfile.artist_name}</CardTitle>
        {artistProfile.genre && <p className="text-orange-400 text-sm">{artistProfile.genre}</p>}
        <p className="text-gray-400 text-sm">@{artistProfile.profiles?.username || 'Unknown'}</p>

        {user?.id === artistProfile.user_id && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="outline" size="sm" className="text-white border-orange-500/50 hover:bg-orange-500/20">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteProfile}>
              <Trash className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {artistProfile.bio && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Bio</h4>
            <p className="text-gray-300 whitespace-pre-wrap">{artistProfile.bio}</p>
          </div>
        )}

        {(artistProfile.social_links?.instagram || artistProfile.social_links?.youtube || artistProfile.contact_email) && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {artistProfile.social_links?.instagram && (
                <Button variant="outline" className="text-white border-orange-500/50 hover:bg-orange-500/20" asChild>
                  <a href={artistProfile.social_links.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 mr-2" /> Instagram
                  </a>
                </Button>
              )}
              {artistProfile.social_links?.youtube && (
                <Button variant="outline" className="text-white border-orange-500/50 hover:bg-orange-500/20" asChild>
                  <a href={artistProfile.social_links.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="w-4 h-4 mr-2" /> YouTube
                  </a>
                </Button>
              )}
              {artistProfile.contact_email && (
                <Button variant="outline" className="text-white border-orange-500/50 hover:bg-orange-500/20" asChild>
                  <a href={`mailto:${artistProfile.contact_email}`}>
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {loadingMedia ? (
          <p className="text-center text-gray-400">Loading media...</p>
        ) : media.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    {item.media_type === 'audio' && (
                      <audio controls src={item.url} className="w-full" />
                    )}
                    {item.media_type === 'video' && (
                      <video controls src={item.url} className="w-full h-40 object-cover" />
                    )}
                    {item.media_type === 'image' && (
                      <img src={item.url} alt={item.title} className="w-full h-40 object-cover rounded-md" />
                    )}
                    <p className="text-white font-semibold mt-2">{item.title}</p>
                    {item.description && <p className="text-gray-400 text-sm">{item.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistProfileCard;


