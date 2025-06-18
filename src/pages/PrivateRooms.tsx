
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Plus, CreditCard } from 'lucide-react';
import Navigation from '@/components/Navigation';

const PrivateRooms = () => {
  const [userCredits] = useState(15);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});

  const mockRooms = [
    {
      id: 1,
      name: 'Kasi Vibes Only',
      creator: 'TownshipKing',
      participants: 5,
      maxParticipants: 8,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      isJoined: true
    },
    {
      id: 2,
      name: 'Beat Makers Circle',
      creator: 'ProducerSA',
      participants: 3,
      maxParticipants: 6,
      expiresAt: Date.now() + (36 * 60 * 60 * 1000), // 36 hours from now
      isJoined: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: number]: number } = {};
      mockRooms.forEach(room => {
        const remaining = Math.max(0, room.expiresAt - Date.now());
        newTimeLeft[room.id] = remaining;
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle room creation logic
    console.log('Creating private room...');
    setShowCreateForm(false);
  };

  const handleJoinRoom = (roomId: number, cost: number) => {
    if (userCredits >= cost) {
      // Handle joining room logic
      console.log(`Joining room ${roomId} for ${cost} credits`);
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
              <p className="text-gray-400">Exclusive spaces for your crew</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Credits</p>
              <Badge className="bg-orange-600 text-white text-lg px-3 py-1">
                <CreditCard className="w-4 h-4 mr-1" />
                {userCredits}
              </Badge>
            </div>
          </div>

          {/* Create Room Button */}
          {!showCreateForm ? (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Private Room (5 Credits)
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
                      placeholder="Enter room name"
                      className="bg-gray-800 border-orange-500/50 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants" className="text-white">Max Participants</Label>
                    <Input 
                      id="maxParticipants"
                      type="number"
                      min="2"
                      max="20"
                      defaultValue="8"
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
                      disabled={userCredits < 5}
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
          
          {mockRooms.map((room) => (
            <Card key={room.id} className="bg-gray-900/50 border border-orange-500/20 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
                    <p className="text-gray-400 text-sm">Created by {room.creator}</p>
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
                      {room.participants}/{room.maxParticipants}
                    </span>
                  </div>
                  
                  {room.isJoined ? (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Enter Room
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleJoinRoom(room.id, 3)}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={userCredits < 3}
                    >
                      Join (3 Credits)
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
          ))}
        </div>

        {/* Buy Credits Section */}
        <Card className="mt-8 bg-gradient-to-r from-orange-600/20 to-orange-400/20 border border-orange-500/30">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Need More Credits?</h3>
              <p className="text-gray-400 mb-4">Top up with airtime to access premium features</p>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Credits with Airtime
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivateRooms;
