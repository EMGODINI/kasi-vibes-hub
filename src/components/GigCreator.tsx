import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TicketingIntegration from '@/components/TicketingIntegration';
import { Calendar, Clock, MapPin, Music, Image, Plus, X, DollarSign } from 'lucide-react';

interface GigCreatorProps {
  onGigCreated?: () => void;
}

const GigCreator = ({ onGigCreated }: GigCreatorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [createdGigId, setCreatedGigId] = useState<string | null>(null);
  const [showTicketing, setShowTicketing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_name: '',
    venue_name: '',
    venue_address: '',
    event_date: '',
    event_time: '',
    end_time: '',
    ticket_price: '',
    ticket_url: '',
    contact_info: '',
    genre: '',
    event_type: 'concert',
    capacity: '',
    age_restriction: 'all_ages',
    is_free: false
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.title.trim() || !formData.artist_name.trim() || !formData.venue_name.trim() || !formData.event_date) return;

    setIsLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `gigs/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gig-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('gig-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // Create gig
      const { data: gigData, error } = await supabase
        .from('gigs')
        .insert({
          user_id: profile.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          artist_name: formData.artist_name.trim(),
          venue_name: formData.venue_name.trim(),
          venue_address: formData.venue_address.trim() || null,
          event_date: formData.event_date,
          event_time: formData.event_time || null,
          end_time: formData.end_time || null,
          ticket_price: formData.is_free ? null : (formData.ticket_price ? parseFloat(formData.ticket_price) : null),
          ticket_url: formData.ticket_url.trim() || null,
          contact_info: formData.contact_info.trim() || null,
          genre: formData.genre.trim() || null,
          event_type: formData.event_type,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          age_restriction: formData.age_restriction,
          is_free: formData.is_free,
          image_url: imageUrl
        })
        .select('id')
        .single();

      if (error) throw error;

      // Store the created gig ID for ticketing integration
      setCreatedGigId(gigData.id);

      toast({
        title: "Gig created!",
        description: "Your gig has been posted. You can now set up ticketing if needed.",
      });

      // Show ticketing integration option
      setShowTicketing(true);

      // Notify parent component
      onGigCreated?.();

    } catch (error: any) {
      console.error('Gig creation error:', error);
      toast({
        title: "Failed to create gig",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Advertise Your Gig
      </Button>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-montserrat flex items-center">
            <Music className="w-5 h-5 mr-2 text-purple-400" />
            Advertise Your Gig
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="e.g., Summer Vibes Concert"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist" className="text-white">
                Artist/Performer *
              </Label>
              <Input
                id="artist"
                value={formData.artist_name}
                onChange={(e) => setFormData(prev => ({ ...prev, artist_name: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="e.g., DJ Kasi Vibes"
                maxLength={100}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400 min-h-[80px]"
              placeholder="Describe your event, what to expect, special guests..."
              maxLength={500}
            />
          </div>

          {/* Venue Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="text-white">
                Venue Name *
              </Label>
              <Input
                id="venue"
                value={formData.venue_name}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="e.g., The Groove Club"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white">
                Venue Address
              </Label>
              <Input
                id="address"
                value={formData.venue_address}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="e.g., 123 Long Street, Cape Town"
                maxLength={200}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">
                Event Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-white">
                Start Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endtime" className="text-white">
                End Time
              </Label>
              <Input
                id="endtime"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white focus:border-purple-400"
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Event Type</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger className="bg-gray-800 border-purple-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="dj_set">DJ Set</SelectItem>
                  <SelectItem value="open_mic">Open Mic</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="club_night">Club Night</SelectItem>
                  <SelectItem value="private_party">Private Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre" className="text-white">
                Genre
              </Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="e.g., Amapiano, Hip Hop, House"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Age Restriction</Label>
              <Select value={formData.age_restriction} onValueChange={(value) => setFormData(prev => ({ ...prev, age_restriction: value }))}>
                <SelectTrigger className="bg-gray-800 border-purple-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_ages">All Ages</SelectItem>
                  <SelectItem value="18+">18+</SelectItem>
                  <SelectItem value="21+">21+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: !!checked, ticket_price: checked ? '' : prev.ticket_price }))}
                />
                <Label htmlFor="free" className="text-white">
                  Free Event
                </Label>
              </div>
              {!formData.is_free && (
                <Input
                  value={formData.ticket_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticket_price: e.target.value }))}
                  className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                  placeholder="Ticket price (R)"
                  type="number"
                  min="0"
                  step="0.01"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-white">
                Contact Info
              </Label>
              <Input
                id="contact"
                value={formData.contact_info}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
                placeholder="Phone or email for bookings"
                maxLength={100}
              />
            </div>
          </div>

          {/* Ticket URL */}
          <div className="space-y-2">
            <Label htmlFor="ticketurl" className="text-white">
              Ticket URL
            </Label>
            <Input
              id="ticketurl"
              value={formData.ticket_url}
              onChange={(e) => setFormData(prev => ({ ...prev, ticket_url: e.target.value }))}
              className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400"
              placeholder="https://tickets.example.com/your-event"
              type="url"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-white">Event Poster/Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg object-cover w-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="gig-image-upload"
                />
                <label htmlFor="gig-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Image className="w-4 h-4 mr-2" />
                      Add Event Poster
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.artist_name.trim() || !formData.venue_name.trim() || !formData.event_date}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isLoading ? 'Creating Gig...' : 'Post Gig'}
          </Button>
        </form>
      </CardContent>

      {/* Ticketing Integration Section */}
      {showTicketing && createdGigId && (
        <div className="mt-6">
          <TicketingIntegration 
            gigId={createdGigId} 
            onTicketingUpdated={() => {
              setShowTicketing(false);
              setCreatedGigId(null);
              setFormData({
                title: '',
                description: '',
                artist_name: '',
                venue_name: '',
                venue_address: '',
                event_date: '',
                event_time: '',
                end_time: '',
                ticket_price: '',
                ticket_url: '',
                contact_info: '',
                genre: '',
                event_type: 'concert',
                capacity: '',
                age_restriction: 'all_ages',
                is_free: false
              });
              setImageFile(null);
              setImagePreview(null);
              setIsOpen(false);
            }} 
          />
        </div>
      )}
    </Card>
  );
};

export default GigCreator;

