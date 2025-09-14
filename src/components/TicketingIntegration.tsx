import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, ExternalLink, Plus, Trash2 } from 'lucide-react';

interface TicketType {
  type_name: string;
  description: string;
  price: string;
  quantity_available: string;
  sale_start_date: string;
  sale_end_date: string;
}

interface TicketingIntegrationProps {
  gigId?: string;
  onTicketingUpdated?: () => void;
}

const TicketingIntegration: React.FC<TicketingIntegrationProps> = ({ gigId, onTicketingUpdated }) => {
  const { toast } = useToast();
  const [ticketPlatform, setTicketPlatform] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [ticketPriceMin, setTicketPriceMin] = useState('');
  const [ticketPriceMax, setTicketPriceMax] = useState('');
  const [ticketsAvailable, setTicketsAvailable] = useState('');
  const [earlyBirdPrice, setEarlyBirdPrice] = useState('');
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState('');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      type_name: 'General Admission',
      description: '',
      price: '',
      quantity_available: '',
      sale_start_date: '',
      sale_end_date: ''
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, {
      type_name: '',
      description: '',
      price: '',
      quantity_available: '',
      sale_start_date: '',
      sale_end_date: ''
    }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: string) => {
    const updated = [...ticketTypes];
    updated[index][field] = value;
    setTicketTypes(updated);
  };

  const handleSaveTicketing = async () => {
    if (!gigId) {
      toast({
        title: 'Error',
        description: 'No gig ID provided for ticketing integration.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update gig with ticketing information
      const { error: gigError } = await supabase
        .from('gigs')
        .update({
          ticket_platform: ticketPlatform || null,
          ticket_url: ticketUrl || null,
          ticket_price_min: ticketPriceMin ? parseFloat(ticketPriceMin) : null,
          ticket_price_max: ticketPriceMax ? parseFloat(ticketPriceMax) : null,
          tickets_available: ticketsAvailable ? parseInt(ticketsAvailable) : null,
          early_bird_price: earlyBirdPrice ? parseFloat(earlyBirdPrice) : null,
          early_bird_deadline: earlyBirdDeadline || null,
        })
        .eq('id', gigId);

      if (gigError) throw gigError;

      // Save ticket types
      for (const ticketType of ticketTypes) {
        if (ticketType.type_name && ticketType.price) {
          const { error: typeError } = await supabase
            .from('ticket_types')
            .upsert({
              gig_id: gigId,
              type_name: ticketType.type_name,
              description: ticketType.description || null,
              price: parseFloat(ticketType.price),
              quantity_available: ticketType.quantity_available ? parseInt(ticketType.quantity_available) : null,
              sale_start_date: ticketType.sale_start_date || null,
              sale_end_date: ticketType.sale_end_date || null,
            });

          if (typeError) throw typeError;
        }
      }

      toast({
        title: 'Ticketing Updated',
        description: 'Ticketing information has been successfully saved.',
      });

      onTicketingUpdated?.();

    } catch (error: any) {
      console.error('Error saving ticketing information:', error.message);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save ticketing information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Ticket className="w-5 h-5 mr-2" />
          Ticketing Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* External Ticketing Platform */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">External Ticketing Platform</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticketPlatform" className="text-gray-300">Platform</Label>
              <Select value={ticketPlatform} onValueChange={setTicketPlatform}>
                <SelectTrigger className="bg-gray-800 border-purple-500/50 text-white">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/50 text-white">
                  <SelectItem value="eventbrite">Eventbrite</SelectItem>
                  <SelectItem value="ticketmaster">Ticketmaster</SelectItem>
                  <SelectItem value="webtickets">Webtickets</SelectItem>
                  <SelectItem value="quicket">Quicket</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ticketUrl" className="text-gray-300">Ticket URL</Label>
              <Input
                id="ticketUrl"
                type="url"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="https://eventbrite.com/e/your-event"
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Price Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ticketPriceMin" className="text-gray-300">Min Price (R)</Label>
              <Input
                id="ticketPriceMin"
                type="number"
                value={ticketPriceMin}
                onChange={(e) => setTicketPriceMin(e.target.value)}
                placeholder="50"
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="ticketPriceMax" className="text-gray-300">Max Price (R)</Label>
              <Input
                id="ticketPriceMax"
                type="number"
                value={ticketPriceMax}
                onChange={(e) => setTicketPriceMax(e.target.value)}
                placeholder="200"
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="ticketsAvailable" className="text-gray-300">Total Available</Label>
              <Input
                id="ticketsAvailable"
                type="number"
                value={ticketsAvailable}
                onChange={(e) => setTicketsAvailable(e.target.value)}
                placeholder="500"
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Early Bird */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Early Bird Special</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="earlyBirdPrice" className="text-gray-300">Early Bird Price (R)</Label>
              <Input
                id="earlyBirdPrice"
                type="number"
                value={earlyBirdPrice}
                onChange={(e) => setEarlyBirdPrice(e.target.value)}
                placeholder="40"
                className="bg-gray-800 border-purple-500/50 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="earlyBirdDeadline" className="text-gray-300">Early Bird Deadline</Label>
              <Input
                id="earlyBirdDeadline"
                type="datetime-local"
                value={earlyBirdDeadline}
                onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                className="bg-gray-800 border-purple-500/50 text-white"
              />
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Ticket Types</h4>
            <Button
              type="button"
              onClick={addTicketType}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>
          
          {ticketTypes.map((ticketType, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-white font-medium">Ticket Type {index + 1}</h5>
                  {ticketTypes.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300">Type Name</Label>
                    <Input
                      value={ticketType.type_name}
                      onChange={(e) => updateTicketType(index, 'type_name', e.target.value)}
                      placeholder="e.g., VIP, General Admission"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Price (R)</Label>
                    <Input
                      type="number"
                      value={ticketType.price}
                      onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                      placeholder="100"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Quantity Available</Label>
                    <Input
                      type="number"
                      value={ticketType.quantity_available}
                      onChange={(e) => updateTicketType(index, 'quantity_available', e.target.value)}
                      placeholder="100"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Input
                      value={ticketType.description}
                      onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                      placeholder="Brief description"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleSaveTicketing}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? 'Saving...' : 'Save Ticketing Information'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TicketingIntegration;

