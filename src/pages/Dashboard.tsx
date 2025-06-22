
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Plus, Heart, MessageSquare, Share, MoreVertical, LogOut } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AudioPlayer from '@/components/AudioPlayer';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const tabs = [
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones },
    { id: 'podcast', label: 'Podcast', icon: Radio },
    { id: 'die-stance', label: 'Die Stance', icon: Car },
    { id: 'umgosi', label: 'Umgosi', icon: MessageCircle },
    { id: 'stoko', label: 'Stoko', icon: Camera },
    { id: 'hustlers', label: 'Hustlers Nje', icon: Briefcase },
    { id: 'styla', label: 'Styla Samahala', icon: Mic },
    { id: 'umdantso', label: 'Umdantso Kuphela', icon: Zap },
  ];

  const mockPosts = useMemo(() => [
    {
      id: 1,
      user: 'KingKasi',
      avatar: '/placeholder.svg',
      content: 'New beat dropped! Check this fire 🔥',
      audioUrl: '/sample-beat.mp3',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      likes: 24,
      comments: 8,
      category: 'siya-pheka',
      isPremium: false
    },
    {
      id: 2,
      user: 'PodcastQueen',
      avatar: '/placeholder.svg',
      content: 'Latest episode of Kasi Stories - Real talk about township life',
      audioUrl: '/sample-podcast.mp3',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      likes: 67,
      comments: 23,
      category: 'podcast',
      isPremium: true
    },
    {
      id: 3,
      user: 'StanceKing',
      avatar: '/placeholder.svg',
      content: 'My new setup is looking clean! Rate the stance 1-10',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
      likes: 156,
      comments: 34,
      category: 'die-stance',
      isPremium: false
    }
  ], []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const PostCard = ({ post }: { post: any }) => (
    <Card className="mb-6 hover:shadow-lg transition-all duration-300 border-0 enhanced-glass border border-orange-500/20 transform hover:scale-[1.01] spring-bounce">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-orange-500/50 spring-bounce hover:ring-orange-400">
              <AvatarImage src={post.avatar} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {post.user[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-sm text-white">{post.user}</p>
                {post.isPremium && (
                  <Badge className="bg-orange-600 text-white text-xs animate-pulse">Premium</Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">2h ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white touch-target">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <Car</Car>dContent className="pt-0">
        <p className="mb-3 text-sm text-gray-300">{post.content}</p>
        
        {post.thumbnail && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt="Content thumbnail" 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {post.audioUrl && (
          <AudioPlayer 
            audioUrl={post.audioUrl}
            title={post.content}
            isPlaying={isPlaying === post.id}
            onPlayPause={() => setIsPlaying(isPlaying === post.id ? null : post.id)}
          />
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
              <Heart className="w-4 h-4 mr-1" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
              <MessageSquare className="w-4 h-4 mr-1" />
              {post.comments}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 touch-target spring-bounce">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white font-montserrat">
                Awe {profile?.username || 'User'}! 👊🏾
              </h1>
              <p className="text-gray-400">Azi'She Khe - What's happening in your kasi today?</p>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-orange-500/50 spring-bounce hover:ring-orange-400">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {profile?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-400 hover:text-orange-500 touch-target"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Post Button */}
          <EnhancedButton 
            variant="floating" 
            className="w-full py-4 rounded-xl shadow-lg hover:shadow-orange-500/25"
            animation="spring"
          >
            <Plus className="w-4 h-4 mr-2" />
            Share your vibe
          </EnhancedButton>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto enhanced-glass mb-6 border border-orange-500/30">
            <TabsTrigger value="all" className="whitespace-nowrap text-white data-[state=active]:bg-orange-600 touch-target">All Vibes</TabsTrigger>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap text-white data-[state=active]:bg-orange-600 touch-target">
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <StaggeredList staggerDelay={150}>
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </StaggeredList>
          </TabsContent>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <div className="text-center py-12 animate-fade-in-up">
                <tab.icon className="w-12 h-12 mx-auto text-orange-500 mb-4 animate-bounce-gentle" />
                <h3 className="text-lg font-semibold mb-2 text-white">{tab.label}</h3>
                <p className="text-gray-400 mb-4">
                  No content yet. Be the first to share in this category!
                </p>
                <EnhancedButton variant="floating" animation="spring">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </EnhancedButton>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
