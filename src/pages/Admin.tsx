
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, Music, Users, FileText, Settings, Play, Pause, Volume2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [welcomeTrack, setWelcomeTrack] = useState('welcome-track.mp3');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTrackUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      toast({
        title: "Track uploaded successfully!",
        description: "New welcome track is now active for first-time users.",
      });
      setIsUploading(false);
    }, 2000);
  };

  const pendingPosts = [
    { id: 1, user: 'NewUser123', content: 'Check out my new ride!', category: 'Die Stance', type: 'Photo' },
    { id: 2, user: 'MusicLover', content: 'Fresh beat for the streets', category: 'Styla Samahala', type: 'Audio' },
    { id: 3, user: 'DanceKing', content: 'New dance challenge!', category: 'Umdantso Kuphela', type: 'Video' },
  ];

  const userStats = {
    totalUsers: 1247,
    activeToday: 89,
    newRegistrations: 23,
    premiumUsers: 156
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/20 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage 3MGodini platform and content</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                  <p className="text-orange-100 text-xs">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 backdrop-blur-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.activeToday}</div>
                  <p className="text-muted-foreground text-xs">+5% from yesterday</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 backdrop-blur-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.newRegistrations}</div>
                  <p className="text-muted-foreground text-xs">+8% from yesterday</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 backdrop-blur-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.premiumUsers}</div>
                  <p className="text-muted-foreground text-xs">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm">New user "KasiKing" registered</span>
                    <Badge variant="secondary">2m ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Post approved in "Die Stance"</span>
                    <Badge variant="secondary">5m ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Premium subscription activated</span>
                    <Badge variant="secondary">12m ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Pending Content Review</CardTitle>
                <CardDescription>Review and approve user submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{post.user}</span>
                          <Badge variant="outline">{post.category}</Badge>
                          <Badge variant="secondary">{post.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{post.content}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-muted-foreground">Manage new user approvals</p>
                    </div>
                    <Button variant="outline">View Queue ({userStats.newRegistrations})</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
                    <div>
                      <p className="font-medium">Premium Subscriptions</p>
                      <p className="text-sm text-muted-foreground">Manage premium user benefits</p>
                    </div>
                    <Button variant="outline">Manage ({userStats.premiumUsers})</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Welcome Track Management</CardTitle>
                <CardDescription>Upload and manage the welcome track for new users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrackUpload} className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                    <Music className="w-8 h-8 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium">Current Welcome Track</p>
                      <p className="text-sm text-muted-foreground">{welcomeTrack}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="track-upload">Upload New Welcome Track</Label>
                    <Input
                      id="track-upload"
                      type="file"
                      accept="audio/*"
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {isUploading ? 'Uploading...' : 'Update Welcome Track'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
                  <div>
                    <p className="font-medium">Content Moderation</p>
                    <p className="text-sm text-muted-foreground">Auto-approve posts from trusted users</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
                  <div>
                    <p className="font-medium">Upload Limits</p>
                    <p className="text-sm text-muted-foreground">Set file size and type restrictions</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
