
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import FloatingIcons from '@/components/FloatingIcons';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import WelcomeAudio from '@/components/WelcomeAudio';
import TopMusicPlayer from '@/components/TopMusicPlayer';
import TrendingAudioPreview from '@/components/TrendingAudioPreview';
import WhatIs3MGodini from '@/components/WhatIs3MGodini';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWelcomeAudio, setShowWelcomeAudio] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, username);
      
      if (!error) {
        setShowWelcomeAudio(true);
        toast({
          title: `Awe ${username}! 👊🏾`,
          description: "Azi'She Khe - Welcome to the 3MGODINI family! Check your email to verify your account.",
        });
        
        // Navigate to welcome page after a delay
        setTimeout(() => {
          navigate('/welcome');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="light min-h-screen bg-gradient-to-br from-background via-secondary to-background relative">
      <WelcomeAudio shouldPlay={showWelcomeAudio} onComplete={() => setShowWelcomeAudio(false)} />
      
      <div className="relative z-10 min-h-screen">
        {/* Mobile-first layout */}
        <div className="block lg:hidden">
          {/* Mobile Layout */}
          <div className="flex flex-col h-screen bg-background">
            {/* Top Music Player */}
            <div className="p-4">
              <TopMusicPlayer />
            </div>
            
            {/* Middle Content - What is 3MGODINI */}
            <div className="px-4 pb-4">
              <WhatIs3MGodini />
            </div>
            
            {/* Trending Content */}
            <div className="flex-1 px-4 pb-4 overflow-y-auto">
              <TrendingAudioPreview />
            </div>
            
            {/* Bottom CTA */}
            <div className="p-4 border-t border-border bg-card">
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 text-lg hover:opacity-90 transition-all duration-300"
                >
                  🔥 Thatha Lento Nge Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-border text-foreground hover:bg-secondary"
                >
                  🎧 Browse as Guest
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 h-screen bg-background">
            {/* Left Content Area */}
            <div className="col-span-8 flex flex-col p-8">
              {/* Top Music Player */}
              <div className="mb-6">
                <TopMusicPlayer />
              </div>
              
              {/* Hero Section */}
              <div className="text-center mb-8">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
                  Welcome to 3MGODINI
                </h1>
                <p className="text-xl text-muted-foreground font-inter mb-6 max-w-3xl mx-auto">
                  Awe mfwethu! Welcome to the Digital Soup. Share your stance, drop your beats, and connect with the culture 🔥
                </p>
              </div>
              
              {/* What is 3MGODINI section */}
              <div className="mb-8">
                <WhatIs3MGodini />
              </div>
              
              {/* Trending Content */}
              <div className="flex-1 overflow-y-auto">
                <TrendingAudioPreview />
              </div>
            </div>
            
            {/* Right Signup Panel */}
            <div className="col-span-4 bg-card border-l border-border p-8 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                  <img 
                    src="/lovable-uploads/8fe769f4-bcea-4c20-ab31-dbe6174dc510.png" 
                    alt="3MGODINI Logo" 
                    className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg"
                  />
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Join the Community
                  </h2>
                  <p className="text-muted-foreground">
                    Azishe Khe! Connect with your people ✊🏾
                  </p>
                </div>
                
                <Card className="clean-card">
                  <CardContent className="p-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-foreground">Username</Label>
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder="Choose your kasi name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="bg-card/50 border-primary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                        {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-card/50 border-primary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                        {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-card/50 border-primary/50 text-foreground placeholder:text-muted-foreground focus:border-primary pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Input 
                            id="confirm-password" 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-card/50 border-primary/50 text-foreground placeholder:text-muted-foreground focus:border-primary pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                      </div>
                      
                      <PasswordStrengthIndicator password={password} />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 text-lg hover:opacity-90 transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : '🔥 Thatha Lento Nge Email'}
                      </Button>
                    </form>

                    <div className="text-center mt-6">
                      <p className="text-muted-foreground mb-4">Already part of the family?</p>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/auth')}
                        className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        Sign In Instead
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
