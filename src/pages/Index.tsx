
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
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
    
    // Simulate registration process - replace with actual Supabase auth
    setTimeout(() => {
      toast({
        title: `Awe ${username}! 👊🏾`,
        description: "Azi'She Khe - Welcome to the 3MGODINI family",
      });
      navigate('/welcome');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black relative overflow-hidden">
      {/* Space-like background with stars */}
      <div className="absolute inset-0 bg-[radial-gradient(white,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:50px_50px] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(white,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:100px_100px] opacity-30"></div>
      
      <FloatingIcons />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-6 animate-pulse">
              <img 
                src="/lovable-uploads/924af0ae-dd6b-494b-a23c-37583952b3e8.png" 
                alt="3MGODINI Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-teal-400 to-orange-400 bg-clip-text text-transparent font-orbitron mb-4">
              Welcome to 3MGODINI
            </h1>
            <p className="text-gray-300 text-lg font-inter mb-6">
              Awe! Welcome to the ultimate kasi social hub. Share your stance, drop your beats, and connect with the culture.
            </p>
          </div>

          {/* Registration Card */}
          <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-white font-montserrat text-2xl">
                Thatha Lento!
              </CardTitle>
              <CardDescription className="text-center text-gray-400 text-lg">
                Join the movement and connect with your kasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Choose your kasi name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
                  />
                  {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500"
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400 focus:border-orange-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                </div>
                
                <PasswordStrengthIndicator password={password} />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 to-teal-400 hover:from-orange-700 hover:to-teal-500 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Thatha Lento!'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-400 mb-4">Already part of the family?</p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
                >
                  Sign In Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
