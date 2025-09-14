import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User, Music, Link as LinkIcon, Mail } from 'lucide-react';

interface ArtistProfileCreatorProps {
  onProfileCreated?: () => void;
  existingProfile?: any; // For editing existing profile
}

const ArtistProfileCreator: React.FC<ArtistProfileCreatorProps> = ({ onProfileCreated, existingProfile }) => {
  const { profile: userProfile } = useAuth();
  const { toast } = useToast();
  const [artistName, setArtistName] = useState(existingProfile?.artist_name || '');
  const [genre, setGenre] = useState(existingProfile?.genre || '');
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(existingProfile?.profile_picture_url || '');
  const [coverImageUrl, setCoverImageUrl] = useState(existingProfile?.cover_image_url || '');
  const [instagramLink, setInstagramLink] = useState(existingProfile?.social_links?.instagram || '');
  const [youtubeLink, setYoutubeLink] = useState(existingProfile?.social_links?.youtube || '');
  const [contactEmail, setContactEmail] = useState(existingProfile?.contact_email || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setArtistName(existingProfile.artist_name || '');
      setGenre(existingProfile.genre || '');
      setBio(existingProfile.bio || '');
      setProfilePictureUrl(existingProfile.profile_picture_url || '');
      setCoverImageUrl(existingProfile.cover_image_url || '');
      setInstagramLink(existingProfile.social_links?.instagram || '');
      setYoutubeLink(existingProfile.social_links?.youtube || '');
      setContactEmail(existingProfile.contact_email || '');
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !artistName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide an artist name.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const socialLinks = {
        instagram: instagramLink.trim() || null,
        youtube: youtubeLink.trim() || null,
      };

      const dataToInsert = {
        user_id: userProfile.id,
        artist_name: artistName.trim(),
        genre: genre.trim() || null,
        bio: bio.trim() || null,
        profile_picture_url: profilePictureUrl.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        social_links: socialLinks,
        contact_email: contactEmail.trim() || null,
      };

      let error;
      if (existingProfile) {
        const { error: updateError } = await supabase.from('artist_profiles').update(dataToInsert).eq('id', existingProfile.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('artist_profiles').insert(dataToInsert);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: existingProfile ? 'Profile Updated' : 'Artist Profile Created',
        description: existingProfile ? 'Your artist profile has been successfully updated.' : 'Your artist profile has been successfully created.',
      });

      // Reset form if new profile, otherwise just notify
      if (!existingProfile) {
        setArtistName('');
        setGenre('');
        setBio('');
        setProfilePictureUrl('');
        setCoverImageUrl('');
        setInstagramLink('');
        setYoutubeLink('');
        setContactEmail('');
      }
      onProfileCreated?.();

    } catch (error: any) {
      console.error('Error saving artist profile:', error.message);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save artist profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-6">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-4">{existingProfile ? 'Edit Your Artist Profile' : 'Create Your Artist Profile'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="artistName" className="text-gray-300">Artist/Band Name <span className="text-red-500">*</span></Label>
            <Input
              id="artistName"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g., Kasi Vibes Crew, DJ Mzansi"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="genre" className="text-gray-300">Genre (Optional)</Label>
            <Input
              id="genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Amapiano, Hip Hop, Gqom, House"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="bio" className="text-gray-300">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your music, your journey, and what makes you unique..."
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 min-h-[80px] resize-none"
            />
          </div>
          <div>
            <Label htmlFor="profilePictureUrl" className="text-gray-300">Profile Picture URL (Optional)</Label>
            <Input
              id="profilePictureUrl"
              type="url"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              placeholder="e.g., https://example.com/my-artist-pic.jpg"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="coverImageUrl" className="text-gray-300">Cover Image URL (Optional)</Label>
            <Input
              id="coverImageUrl"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="e.g., https://example.com/my-artist-cover.jpg"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="instagramLink" className="text-gray-300">Instagram Profile URL (Optional)</Label>
            <Input
              id="instagramLink"
              type="url"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              placeholder="e.g., https://instagram.com/myartist"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="youtubeLink" className="text-gray-300">YouTube Channel URL (Optional)</Label>
            <Input
              id="youtubeLink"
              type="url"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="e.g., https://youtube.com/mychannel"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail" className="text-gray-300">Contact Email (Optional)</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g., booking@myartist.com"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white"
          >
            {isLoading ? (
              'Saving Profile...' 
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> {existingProfile ? 'Update Profile' : 'Create Profile'}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArtistProfileCreator;


