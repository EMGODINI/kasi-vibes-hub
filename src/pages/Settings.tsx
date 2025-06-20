
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Settings as SettingsIcon, Bell, Shield, Palette, Volume2, LogOut } from 'lucide-react';

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white font-montserrat flex items-center">
                <SettingsIcon className="w-6 h-6 mr-2" />
                Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize your 3MGODINI experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-orange-400" />
                    <div>
                      <Label htmlFor="notifications" className="text-white">Push Notifications</Label>
                      <p className="text-sm text-gray-400">Receive notifications about new tracks and updates</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>

              <Separator className="bg-orange-500/20" />

              {/* Appearance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-orange-400" />
                    <div>
                      <Label htmlFor="darkMode" className="text-white">Dark Mode</Label>
                      <p className="text-sm text-gray-400">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>

              <Separator className="bg-orange-500/20" />

              {/* Audio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-orange-400" />
                    <div>
                      <Label htmlFor="soundEnabled" className="text-white">Sound Effects</Label>
                      <p className="text-sm text-gray-400">Enable sound effects and audio feedback</p>
                    </div>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>

              <Separator className="bg-orange-500/20" />

              {/* Account Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <Label className="text-white">Account</Label>
                </div>
                
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
