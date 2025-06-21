
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Edit, Users, Heart, MessageCircle, Settings, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: profile?.username || '',
    bio: 'Car enthusiast from the kasi 🚗',
    location: 'Soweto'
  });

  // Mock data for user profile
  const userStats = {
    posts: 24,
    followers: 1234,
    following: 567,
    likes: 5678
  };

  const userPosts = [
    {
      id: '1',
      image: '/placeholder.svg',
      likes: 234,
      comments: 45,
      type: 'stance'
    },
    {
      id: '2',
      image: '/placeholder.svg',
      likes: 189,
      comments: 32,
      type: 'stance'
    },
    {
      id: '3',
      image: '/placeholder.svg',
      likes: 156,
      comments: 28,
      type: 'stoko'
    }
  ];

  const handleSaveProfile = () => {
    // Simulate profile update
    toast({
      title: "Profile updated!",
      description: "Your changes have been saved",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    toast({
      title: "Avatar upload",
      description: "Feature coming soon with cropping tool!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Profile</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-orange-500 hover:text-orange-400"
            >
              <Edit className="w-4 h-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || '/placeholder.svg'} />
                <AvatarFallback className="bg-orange-600 text-white text-xl">
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  onClick={handleAvatarUpload}
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    placeholder="Username"
                    className="bg-gray-800 border-gray-600"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Bio"
                    className="bg-gray-800 border-gray-600 min-h-[60px]"
                  />
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      placeholder="Location"
                      className="bg-gray-800 border-gray-600 pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-white">{profile?.username || 'User'}</h3>
                  <p className="text-gray-300 text-sm mt-1">{editForm.bio}</p>
                  <div className="flex items-center text-gray-400 text-sm mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {editForm.location}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{userStats.posts}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{userStats.followers}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{userStats.following}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{userStats.likes}</div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="posts" className="text-gray-300 data-[state=active]:text-orange-500">
                Posts
              </TabsTrigger>
              <TabsTrigger value="likes" className="text-gray-300 data-[state=active]:text-orange-500">
                Likes
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-gray-300 data-[state=active]:text-orange-500">
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                {userPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square">
                    <img
                      src={post.image}
                      alt="User post"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center space-x-3 text-white">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className="absolute top-2 left-2 text-xs"
                      variant={post.type === 'stance' ? 'default' : 'secondary'}
                    >
                      {post.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="likes" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Liked posts will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Your comments will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
