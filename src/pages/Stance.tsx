
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Heart, MessageCircle, Share, Filter, Plus, Car, Flame, X, MapPin, Calendar, MessageSquare } from 'lucide-react';
import ForumFeed from '@/components/ForumFeed';
import AdManager from '@/components/AdManager';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import UploadPostModal from '@/components/UploadPostModal';
import ProfileModal from '@/components/ProfileModal';
import { PagePlaylist } from '@/components/playlist/PagePlaylist';
import { useToast } from '@/hooks/use-toast';

const Stance = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: { username: 'stance_king', avatar: '/placeholder.svg' },
      image: '/placeholder.svg',
      video: null,
      caption: 'My E30 finally done with the new wraps 🔥',
      tags: ['BMW', 'E30', 'Wraps', '325i'],
      likes: 234,
      comments: [
        { user: 'car_lover', text: 'Yoh this is clean bro! 🔥' },
        { user: 'stance_nation', text: 'Which wrap shop did this?' }
      ],
      shares: 45,
      isLiked: false,
      timestamp: '2h ago',
      location: 'Soweto',
      spinOffVotes: { fire: 187, cross: 12 }
    },
    {
      id: '2',
      user: { username: 'vw_goddess', avatar: '/placeholder.svg' },
      image: '/placeholder.svg',
      video: null,
      caption: 'Polo Vivo on spinners hitting different 💫',
      tags: ['VW', 'Polo', 'Spinners', 'LowLife'],
      likes: 189,
      comments: [
        { user: 'spinner_squad', text: 'Which size spinners these?' }
      ],
      shares: 32,
      isLiked: true,
      timestamp: '4h ago',
      location: 'Alex',
      spinOffVotes: { fire: 156, cross: 8 }
    }
  ]);

  const carBrands = ['All', 'BMW', 'VW', 'Toyota', 'Audi', 'Honda', 'Opel', 'Ford'];
  const upcomingEvents = [
    { name: 'Kasi Cruise', date: 'This Saturday', location: 'Soweto' },
    { name: 'Stance Wars', date: 'Next Weekend', location: 'Joburg CBD' }
  ];

  const sponsoredAds = [
    {
      id: '1',
      business: 'KingZ Wraps',
      image: '/placeholder.svg',
      contact: '071 234 5678',
      location: 'Mofolo, Soweto'
    },
    {
      id: '2',
      business: 'Cheap Oil & Parts',
      image: '/placeholder.svg',
      contact: '082 987 6543',
      location: 'Alexandra'
    }
  ];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSpinOffVote = (postId: string, voteType: 'fire' | 'cross') => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            spinOffVotes: {
              ...post.spinOffVotes,
              [voteType]: post.spinOffVotes[voteType] + 1
            }
          }
        : post
    ));
    toast({
      title: voteType === 'fire' ? "🔥 Fire vote!" : "❌ Cross vote!",
      description: "Your vote has been counted"
    });
  };

  const filteredPosts = selectedFilter === 'all' 
    ? posts 
    : posts.filter(post => post.tags.some(tag => tag.toLowerCase().includes(selectedFilter.toLowerCase())));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-md border-b border-orange-500/30 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent font-orbitron">
                  Die Stance
                </h1>
                <p className="text-sm text-gray-400">Drop your whip, show your style</p>
              </div>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12 w-12 p-0 floating-icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {carBrands.map((brand) => (
              <Button
                key={brand}
                variant={selectedFilter === brand.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(brand.toLowerCase())}
                className={`whitespace-nowrap ${
                  selectedFilter === brand.toLowerCase() 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-300 border-gray-600 hover:border-orange-500'
                }`}
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Events & Ads */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-white">Kasi Events</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-400">{event.name}</h4>
                    <p className="text-sm text-gray-300">{event.date}</p>
                    <p className="text-xs text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.location}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sponsored Ads */}
            <AdManager 
              pageSlug="stance" 
              adType="card" 
              maxAds={1}
              showCloseButton={true}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Discussion Forum */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                Community Discussions 💬
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Share your thoughts, ask questions, and connect with fellow enthusiasts.
              </p>
              <ForumFeed forumSlug="stance-community" />
            </div>

            {filteredPosts.map((post) => (
              <Card key={post.id} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        className="cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setIsProfileModalOpen(true)}
                      >
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-white cursor-pointer hover:text-orange-400">
                          {post.user.username}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{post.timestamp}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {post.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Post Image */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-900">
                    <img 
                      src={post.image} 
                      alt="Car post" 
                      className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/50 text-white">
                        <Car className="w-3 h-3 mr-1" />
                        Stance
                      </Badge>
                    </div>
                  </div>

                  {/* Caption & Tags */}
                  <div>
                    <p className="text-white mb-2">{post.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-orange-600/20 text-orange-300 hover:bg-orange-600/30">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Spin-Off Voting */}
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">Spin-Off Challenge Vote:</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpinOffVote(post.id, 'fire')}
                        className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                      >
                        <Flame className="w-4 h-4 mr-1" />
                        {post.spinOffVotes.fire}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpinOffVote(post.id, 'cross')}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {post.spinOffVotes.cross}
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`${post.isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-400`}
                      >
                        <Heart className={`w-5 h-5 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-400">
                        <MessageCircle className="w-5 h-5 mr-1" />
                        {post.comments.length}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-400">
                        <Share className="w-5 h-5 mr-1" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>

                  {/* Comments Preview */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.slice(0, 2).map((comment, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="font-medium text-orange-400 text-sm">{comment.user}</span>
                          <span className="text-gray-300 text-sm">{comment.text}</span>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-400 p-0 h-auto">
                          View all {post.comments.length} comments
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Playlist Section */}
            <div className="mt-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent mb-2">
                  Stance Sessions
                </h2>
                <p className="text-gray-400">Chill vibes for your stance sessions 🎵</p>
              </div>
              <PagePlaylist pageSlug="stance" className="max-w-2xl mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadPostModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        pageType="stance"
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Mobile Bottom Padding */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default Stance;
