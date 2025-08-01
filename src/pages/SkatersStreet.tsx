import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Calendar, Trophy } from 'lucide-react';
import skatersStreetBg from '@/assets/skaters-street-bg.jpg';

const SkatersStreet = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Montage Background */}
      <div 
        className="relative h-[70vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${skatersStreetBg})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Skaters Street
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Where the streets meet the beats - Join the ultimate skating community
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Activity className="mr-2 h-4 w-4" />
                Join the Crew
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                Watch Sessions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Community Stats */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-800">Active</Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Community</h3>
            <p className="text-gray-600 mb-4">Connect with skaters from around the globe</p>
            <div className="text-2xl font-bold text-orange-600">2.5K+ Members</div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800">Weekly</Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Street Sessions</h3>
            <p className="text-gray-600 mb-4">Join weekly skating sessions and meetups</p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              View Schedule
            </Button>
          </Card>

          {/* Competitions */}
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-red-600" />
              <Badge className="bg-red-100 text-red-800">Live</Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Competitions</h3>
            <p className="text-gray-600 mb-4">Show your skills in monthly battles</p>
            <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              Enter Contest
            </Button>
          </Card>
        </div>

        {/* Featured Content */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Latest from the Streets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Street Style Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Discover the latest tricks and techniques from our community's top skaters
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-200 to-purple-200" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Gear Reviews</h3>
                <p className="text-muted-foreground mb-4">
                  Check out reviews of the latest boards, wheels, and street wear
                </p>
                <Button variant="outline">Read Reviews</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkatersStreet;