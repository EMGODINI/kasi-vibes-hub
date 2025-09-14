import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Route, Clock, Ruler } from 'lucide-react';

interface RouteCreatorProps {
  onRouteCreated?: () => void;
}

const RouteCreator: React.FC<RouteCreatorProps> = ({ onRouteCreated }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !routeName.trim() || !startLocation.trim() || !endLocation.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide route name, start, and end locations.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('routes').insert({
        user_id: profile.id,
        route_name: routeName.trim(),
        description: description.trim() || null,
        start_location: startLocation.trim(),
        end_location: endLocation.trim(),
        distance_km: distance ? parseFloat(distance) : null,
        duration_minutes: duration ? parseInt(duration) : null,
      });

      if (error) throw error;

      toast({
        title: 'Route Created',
        description: 'Your route has been successfully shared.',
      });

      // Reset form
      setRouteName('');
      setDescription('');
      setStartLocation('');
      setEndLocation('');
      setDistance('');
      setDuration('');
      onRouteCreated?.();

    } catch (error: any) {
      console.error('Error creating route:', error.message);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create route. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-6">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-4">Share a New Route</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="routeName" className="text-gray-300">Route Name <span className="text-red-500">*</span></Label>
            <Input
              id="routeName"
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., Home to Work, Weekend Cycle"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="startLocation" className="text-gray-300">Start Location <span className="text-red-500">*</span></Label>
            <Input
              id="startLocation"
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="e.g., Soweto, Johannesburg"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="endLocation" className="text-gray-300">End Location <span className="text-red-500">*</span></Label>
            <Input
              id="endLocation"
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="e.g., Sandton, Johannesburg"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="distance" className="text-gray-300">Distance (km, Optional)</Label>
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g., 15.5"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-gray-300">Duration (minutes, Optional)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 45"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the route, e.g., 'Scenic drive with minimal traffic.'"
              className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 min-h-[80px] resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white"
          >
            {isLoading ? (
              'Sharing Route...' 
            ) : (
              <><Route className="w-4 h-4 mr-2" /> Share Route</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteCreator;


