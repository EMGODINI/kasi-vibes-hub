
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Plus, Heart, MessageSquare, Share, MoreVertical } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Dashboard = () => {
  const [username] = useState('User');
  
  const tabs = [
    { id: 'die-stance', label: 'Die Stance', icon: Car },
    { id: 'umgosi', label: 'Umgosi', icon: MessageCircle },
    { id: 'stoko', label: 'Stoko', icon: Camera },
    { id: 'hustlers', label: 'Hustlers Nje', icon: Briefcase },
    { id: 'styla', label: 'Styla Samahala', icon: Mic },
    { id: 'umdantso', label: 'Umdantso Kuphela', icon: Zap },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones },
    { id: 'live-mix', label: 'Live Mix', icon: Radio },
  ];

  const mockPosts = [
    {
      id: 1,
      user: 'KingKasi',
      avatar: '/placeholder.svg',
      content: 'Just dropped my new stance setup! 🔥',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
      likes: 24,
      comments: 8,
      category: 'die-stance'
    },
    {
      id: 2,
      user: 'MusicMakerSA',
      avatar: '/placeholder.svg',
      content: 'New beat dropping this weekend! Who wants to freestyle on this? 🎤',
      likes: 45,
      comments: 12,
      category: 'styla'
    },
    {
      id: 3,
      user: 'DanceQueen',
      avatar: '/placeholder.svg',
      content: 'Dance battle challenge accepted! 💃🏾',
      video: true,
      likes: 67,
      comments: 23,
      category: 'umdantso'
    }
  ];

  const PostCard = ({ post }: { post: any }) => (
    <Card className="mb-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-orange-200">
              <AvatarImage src={post.avatar} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {post.user[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user}</p>
              <p className="text-xs text-muted-foreground">2h ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 text-sm">{post.content}</p>
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {post.video && (
          <div className="mb-3 h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
            <p className="text-orange-600 font-medium">🎥 Video Content</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
              <Heart className="w-4 h-4 mr-1" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
              <MessageSquare className="w-4 h-4 mr-1" />
              {post.comments}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Awe {username}! 👊🏾</h1>
              <p className="text-muted-foreground">What's happening in your kasi today?</p>
            </div>
            <Avatar className="w-12 h-12 ring-2 ring-orange-200">
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {username[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Quick Post Button */}
          <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Share your vibe
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-white/50 backdrop-blur-sm mb-6">
            <TabsTrigger value="all" className="whitespace-nowrap">All Vibes</TabsTrigger>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap">
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <div className="text-center py-12">
                <tab.icon className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{tab.label}</h3>
                <p className="text-muted-foreground mb-4">
                  No content yet. Be the first to share in this category!
                </p>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
