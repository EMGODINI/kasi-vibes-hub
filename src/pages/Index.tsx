
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes default
  const [volume, setVolume] = useState([75]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Main Player Card */}
        <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
          {/* Album Art - Golden 3MG Logo */}
          <div className="aspect-square rounded-xl mb-6 shadow-2xl bg-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-500/5"></div>
            <div className="relative z-10">
              <div className="text-8xl font-black text-yellow-500 tracking-wider" style={{fontFamily: 'Orbitron, monospace'}}>
                3MG
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">
              3MGODINI • DIGITAL SOUP
            </p>
            <h1 className="text-white text-lg font-bold mb-3 leading-tight">
              Welcome to the Community
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Awe mfwethu! Connect with your people and share your stance 🔥
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[currentTime]}
              onValueChange={([value]) => setCurrentTime(value)}
              max={duration}
              step={1}
              className="mb-3 [&>span[role=slider]]:bg-green-500 [&>span[data-orientation=horizontal]]:bg-green-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-green-500 text-black hover:bg-green-400 hover:scale-105 flex items-center justify-center transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1 [&>span[role=slider]]:bg-green-500 [&>span[data-orientation=horizontal]]:bg-green-500"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          <div className="spotify-card p-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full bg-green-500 text-black hover:bg-green-400 font-semibold py-3 text-base rounded-full border-0"
            >
              Join the Community
            </Button>
          </div>
          
          <div className="spotify-card p-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-full py-3 bg-transparent"
            >
              Browse as Guest
            </Button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground font-medium">
            Powered by <span className="text-green-500">3MGODINI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
