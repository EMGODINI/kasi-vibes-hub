import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Image, Plus, X } from 'lucide-react';

interface SkateSpotCreatorProps {
  onSpotCreated?: () => void;
}

const SkateSpotCreator = ({ onSpotCreated }: SkateSpotCreatorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_name: '',
    spot_type: 'street',
    difficulty_level: 'intermediate',
    surface_type: 'concrete',
    is_public: true,
    is_legal: true
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
    if (!profile || !formData.name.trim() || !formData.location_name.trim()) return;

    setIsLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `skate-spots/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('skate-spot-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('skate-spot-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // Create skate spot
      const { error } = await supabase
        .from('skate_spots')
        .insert({
          user_id: profile.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          location_name: formData.location_name.trim(),
          spot_type: formData.spot_type,
          difficulty_level: formData.difficulty_level,
          surface_type: formData.surface_type,
          is_public: formData.is_public,
          is_legal: formData.is_legal,
          image_url: imageUrl
        });

      if (error) throw error;

      // Reset form
      setFormData({
        name: '',
        description: '',
        location_name: '',
        spot_type: 'street',
        difficulty_level: 'intermediate',
        surface_type: 'concrete',
        is_public: true,
        is_legal: true
      });
      setImageFile(null);
      setImagePreview(null);
      setIsOpen(false);

      toast({
        title: "Skate spot shared!",
        description: "Your skate spot has been added to the community.",
      });

      // Notify parent component
      onSpotCreated?.();

    } catch (error: any) {
      console.error('Skate spot creation error:', error);
      toast({
        title: "Failed to share spot",
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
        className="w-full bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:from-roll-up-neon-green/80 hover:to-roll-up-ultraviolet/80 text-black font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Share a Skate Spot
      </Button>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-roll-up-neon-green/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-montserrat flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-roll-up-neon-green" />
            Share a Skate Spot
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
              <Label htmlFor="name" className="text-white">
                Spot Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-roll-up-neon-green/50 text-white placeholder:text-gray-400 focus:border-roll-up-neon-green"
                placeholder="e.g., City Hall Steps"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                className="bg-gray-800 border-roll-up-neon-green/50 text-white placeholder:text-gray-400 focus:border-roll-up-neon-green"
                placeholder="e.g., Downtown Cape Town"
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
              className="bg-gray-800 border-roll-up-neon-green/50 text-white placeholder:text-gray-400 focus:border-roll-up-neon-green min-h-[80px]"
              placeholder="Describe the spot, obstacles, best times to skate..."
              maxLength={500}
            />
          </div>

          {/* Spot Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Spot Type</Label>
              <Select value={formData.spot_type} onValueChange={(value) => setFormData(prev => ({ ...prev, spot_type: value }))}>
                <SelectTrigger className="bg-gray-800 border-roll-up-neon-green/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="park">Skate Park</SelectItem>
                  <SelectItem value="bowl">Bowl</SelectItem>
                  <SelectItem value="vert">Vert Ramp</SelectItem>
                  <SelectItem value="ledge">Ledge</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="stairs">Stairs</SelectItem>
                  <SelectItem value="gap">Gap</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Difficulty</Label>
              <Select value={formData.difficulty_level} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}>
                <SelectTrigger className="bg-gray-800 border-roll-up-neon-green/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Surface</Label>
              <Select value={formData.surface_type} onValueChange={(value) => setFormData(prev => ({ ...prev, surface_type: value }))}>
                <SelectTrigger className="bg-gray-800 border-roll-up-neon-green/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concrete">Concrete</SelectItem>
                  <SelectItem value="asphalt">Asphalt</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-white">Photo</Label>
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
                  id="spot-image-upload"
                />
                <label htmlFor="spot-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-roll-up-neon-green/50 text-roll-up-neon-green hover:bg-roll-up-neon-green/10 cursor-pointer"
                    asChild
                  >
                    <span>
                      <Image className="w-4 h-4 mr-2" />
                      Add Photo
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim() || !formData.location_name.trim()}
            className="w-full bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:from-roll-up-neon-green/80 hover:to-roll-up-ultraviolet/80 text-black font-semibold"
          >
            {isLoading ? 'Sharing Spot...' : 'Share Spot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SkateSpotCreator;

