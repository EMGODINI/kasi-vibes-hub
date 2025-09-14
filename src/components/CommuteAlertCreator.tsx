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
import { AlertTriangle, MapPin, Clock, Plus, X } from 'lucide-react';

interface CommuteAlertCreatorProps {
  onAlertCreated?: () => void;
}

const CommuteAlertCreator = ({ onAlertCreated }: CommuteAlertCreatorProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alert_type: 'traffic_jam',
    location_name: '',
    latitude: '',
    longitude: '',
    severity: 'medium',
    valid_until: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.title.trim() || !formData.alert_type || !formData.location_name.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('commute_alerts')
        .insert({
          user_id: profile.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          alert_type: formData.alert_type,
          location_name: formData.location_name.trim(),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          severity: formData.severity,
          valid_until: formData.valid_until || null
        });

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        description: '',
        alert_type: 'traffic_jam',
        location_name: '',
        latitude: '',
        longitude: '',
        severity: 'medium',
        valid_until: ''
      });
      setIsOpen(false);

      toast({
        title: "Alert posted!",
        description: "Your commute alert has been shared with the community.",
      });

      onAlertCreated?.();

    } catch (error: any) {
      console.error('Commute alert creation error:', error);
      toast({
        title: "Failed to post alert",
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
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        Post a Commute Alert
      </Button>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-red-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-montserrat flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Post a Commute Alert
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
                Alert Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400"
                placeholder="e.g., Heavy traffic on N1 North"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                Location Name *
              </Label>
              <Input
                id="location"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                className="bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400"
                placeholder="e.g., M1 South, Sandton"
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
              className="bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400 min-h-[80px]"
              placeholder="Provide more details about the alert..."
              maxLength={500}
            />
          </div>

          {/* Alert Type and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Alert Type *</Label>
              <Select value={formData.alert_type} onValueChange={(value) => setFormData(prev => ({ ...prev, alert_type: value as any }))}>
                <SelectTrigger className="bg-gray-800 border-red-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic_jam">Traffic Jam</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="road_closure">Road Closure</SelectItem>
                  <SelectItem value="public_transport_delay">Public Transport Delay</SelectItem>
                  <SelectItem value="public_transport_breakdown">Public Transport Breakdown</SelectItem>
                  <SelectItem value="protest">Protest</SelectItem>
                  <SelectItem value="weather_hazard">Weather Hazard</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}>
                <SelectTrigger className="bg-gray-800 border-red-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Coordinates and Valid Until */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-white">
                Latitude (Optional)
              </Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400"
                placeholder="e.g., -26.1952"
                type="number"
                step="any"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-white">
                Longitude (Optional)
              </Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400"
                placeholder="e.g., 28.0340"
                type="number"
                step="any"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil" className="text-white">
                Valid Until (Optional)
              </Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                className="bg-gray-800 border-red-500/50 text-white focus:border-red-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.alert_type || !formData.location_name.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
          >
            {isLoading ? 'Posting Alert...' : 'Post Alert'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommuteAlertCreator;

