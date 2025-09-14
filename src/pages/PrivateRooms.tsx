
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Plus, CreditCard, Lock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import BadgeIcon from '@/components/BadgeIcon';
import VerificationModal from '@/components/VerificationModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PrivateRooms = () => {
  const { user, isVerified } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('private_rooms')
        .select(`
          *,
          profiles!private_rooms_host_id_fkey(username)
        `)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: number } = {};
      rooms.forEach(room => {
        const remaining = Math.max(0, new Date(room.expires_at).getTime() - Date.now());
        newTimeLeft[room.id] = remaining;
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [rooms]);

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isVerified) {
      setShowVerificationModal(true);
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('roomName') as string;
    const emoji = formData.get('emoji') as string || '🎧';
    const maxParticipants = parseInt(formData.get('maxParticipants') as string) || 5;

    try {
      const { error } = await supabase
        .from('private_rooms')
        .insert({
          name,
          emoji,
          host_id: user.id,
          max_participants: maxParticipants,
          participant_ids: [user.id]
        });

      if (error) throw error;

      toast({
        title: "Room Created!",
        description: "Your private room is now active",
      });
      
      setShowCreateForm(false);
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      });
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user || !isVerified) {
      setShowVerificationModal(true);
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Check if room is full
    if (room.participant_ids?.length >= room.max_participants) {
      // Initiate payment for room join
      try {
        const { data, error } = await supabase.functions.invoke('payment-handler', {
          body: {
            type: 'room_join',
            userId: user.id,
            phoneNumber: '+27123456789', // You'd get this from user input
            roomId
          }
        });

        if (error) throw error;

        toast({
          title: "Payment Required",
          description: "Room is full. Please confirm payment to join (R5)",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initiate payment",
          variant: "destructive"
        });
      }
    } else {
      // Join room directly
      try {
        const updatedParticipants = [...(room.participant_ids || []), user.id];
        const { error } = await supabase
          .from('private_rooms')
          .update({ participant_ids: updatedParticipants })
          .eq('id', roomId);

        if (error) throw error;

        toast({
          title: "Joined Room!",
          description: "You've successfully joined the room",
        });
        
        fetchRooms();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to join room",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
        <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-montserrat flex items-center">
                <Users className="w-8 h-8 mr-3 text-orange-500" />
                Private Rooms
              </h1>
              <p className="text-gray-400">Exclusive spaces for verified users</p>
            </div>
            {user && (
              <div className="flex items-center space-x-2">
                <BadgeIcon userId={user.id} size="lg" />
                {!isVerified && (
                  <Button
                    size="sm"
                    onClick={() => setShowVerificationModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Get Verified
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Create Room Button */}
          {!showCreateForm ? (
            <Button 
              onClick={() => isVerified ? setShowCreateForm(true) : setShowVerificationModal(true)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              disabled={!user}
            >
              {!isVerified && <Lock className="w-4 h-4 mr-2" />}
              <Plus className="w-4 h-4 mr-2" />
              {isVerified ? 'Create Private Room' : 'Get Verified to Create Room'}
            </Button>
          ) : (
            <Card className="bg-gray-900/50 border border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Create Private Room</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <Label htmlFor="roomName" className="text-white">Room Name</Label>
                    <Input 
                      id="roomName"
                      name="roomName"
                      placeholder="Enter room name"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emoji" className="text-white">Room Emoji</Label>
                    <Input 
                      id="emoji"
                      name="emoji"
                      placeholder="🎧"
                      defaultValue="🎧"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants" className="text-white">Max Participants</Label>
                    <Input 
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="2"
                      max="5"
                      defaultValue="5"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      required
                    />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg border border-orange-500/30">
                    <p className="text-orange-400 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Room will expire in 48 hours
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Cost: 5 credits to create
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!isVerified}
                    >
                      Create Room
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Rooms */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Active Rooms</h2>
          
          {loading ? (
            <p className="text-gray-400">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <Card className="bg-gray-900/50 border border-orange-500/20">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 mb-4">No active rooms yet</p>
                {isVerified && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Create the First Room
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            rooms.map((room) => (
            <Card key={room.id} className="bg-gray-900/50 border border-orange-500/20 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{room.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Created by {room.profiles?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-orange-500 text-orange-400 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeLeft(timeLeft[room.id] || 0)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      {room.participant_ids?.length || 0}/{room.max_participants}
                    </span>
                  </div>
                  
                  {user && room.participant_ids?.includes(user.id) ? (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Enter Room
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!isVerified}
                    >
                      {!isVerified ? (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Get Verified
                        </>
                      ) : room.participant_ids?.length >= room.max_participants ? (
                        'Join (R5)'
                      ) : (
                        'Join Free'
                      )}
                    </Button>
                  )}
                </div>

                {timeLeft[room.id] <= 0 && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">This room has expired</p>
                  </div>
                )}
              </CardContent>
            </Card>
            ))
          )}
        </div>

        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />
      </div>
    </div>
  );
};

export default PrivateRooms;
