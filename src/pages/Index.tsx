
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
    <div className="min-h-screen bg-gradient-to-br from-charcoal-black via-deep-maroon to-charcoal-black relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,215,0,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,255,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(255,20,147,0.1)_0%,transparent_50%)]"></div>
      
      <FloatingIcons />
      <WelcomeAudio shouldPlay={showWelcomeAudio} onComplete={() => setShowWelcomeAudio(false)} />
      
      <div className="relative z-10 min-h-screen">
        {/* Mobile-first layout */}
        <div className="block lg:hidden">
          {/* Mobile Layout */}
          <div className="flex flex-col h-screen">
            {/* Top Music Player */}
            <div className="p-4">
              <TopMusicPlayer />
            </div>
            
            {/* Middle Trending Content */}
            <div className="flex-1 px-4 pb-4 overflow-y-auto">
              <TrendingAudioPreview />
            </div>
            
            {/* Bottom Signup */}
            <div className="p-4 border-t border-primary/20">
              <Card className="kasi-glass">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/lovable-uploads/924af0ae-dd6b-494b-a23c-37583952b3e8.png" 
                      alt="3MGODINI Logo" 
                      className="w-16 h-16 object-contain animate-pulse-neon"
                    />
                  </div>
                  <CardTitle className="text-center township-header text-lg">
                    Thatha Lento!
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Join the kasi revolution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="w-full kasi-button animate-shimmer-gold"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/50 text-primary hover:bg-primary/10"
                  >
                    Create Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 h-screen">
            {/* Left Content Area */}
            <div className="col-span-8 flex flex-col p-6">
              {/* Top Music Player */}
              <div className="mb-6">
                <TopMusicPlayer />
              </div>
              
              {/* Hero Section */}
              <div className="text-center mb-8">
                <h1 className="text-6xl font-bold township-header mb-4">
                  Welcome to 3MGODINI
                </h1>
                <p className="text-xl text-muted-foreground font-inter mb-6">
                  Awe! Welcome to the ultimate kasi social hub. Share your stance, drop your beats, and connect with the culture.
                </p>
              </div>
              
              {/* Trending Content */}
              <div className="flex-1 overflow-y-auto">
                <TrendingAudioPreview />
              </div>
            </div>
            
            {/* Right Signup Panel */}
            <div className="col-span-4 bg-gradient-to-br from-background/50 to-card/50 backdrop-blur-lg border-l border-primary/20 p-6 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                  <img 
                    src="/lovable-uploads/924af0ae-dd6b-494b-a23c-37583952b3e8.png" 
                    alt="3MGODINI Logo" 
                    className="w-24 h-24 mx-auto mb-4"
                  />
                </div>
                
                <Card className="party-glass">
                  <CardHeader>
                    <CardTitle className="text-center township-header text-2xl">
                      Thatha Lento!
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground text-lg">
                      Join the movement and connect with your kasi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                        className="w-full kasi-button animate-shimmer-gold font-semibold py-3 text-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Thatha Lento!'}
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
