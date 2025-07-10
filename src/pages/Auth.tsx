import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import FloatingIcons from '@/components/FloatingIcons';
import WelcomeAudio from '@/components/WelcomeAudio';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWelcomeAudio, setShowWelcomeAudio] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (isSignUp: boolean) => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (isSignUp) {
      if (!username.trim()) newErrors.username = 'Username is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, username);
      if (!error) {
        setShowWelcomeAudio(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background relative overflow-hidden">
      <FloatingIcons />
      <WelcomeAudio shouldPlay={showWelcomeAudio} onComplete={() => setShowWelcomeAudio(false)} />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-3xl shadow-2xl mb-6 animate-pulse">
              <span className="text-3xl font-bold text-white font-orbitron">3MG</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent font-orbitron mb-4">
              3MGODINI
            </h1>
            <p className="text-muted-foreground text-lg font-inter">
              Thatha Lento to join the kasi movement
            </p>
          </div>

          <Card className="backdrop-blur-md bg-card/90 border border-accent/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-foreground font-montserrat">Join the Culture</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Connect with your kasi, share your vibe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-accent/20">
                  <TabsTrigger value="login" className="text-foreground data-[state=active]:bg-accent data-[state=active]:text-white">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-foreground data-[state=active]:bg-accent data-[state=active]:text-white">Thatha Lento!</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-foreground">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                      />
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input 
                          id="login-password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent pr-10"
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
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-accent to-primary text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-foreground">Username</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                      />
                      {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-foreground">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent"
                      />
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input 
                          id="register-password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent pr-10"
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
                          className="bg-accent/10 border-accent/50 text-foreground placeholder:text-muted-foreground focus:border-accent pr-10"
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
                      className="w-full bg-gradient-to-r from-accent to-primary text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Thatha Lento!'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-accent"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;