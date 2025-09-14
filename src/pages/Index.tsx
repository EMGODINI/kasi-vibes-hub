
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
        <div className="spotify-glass p-6 mb-6">
          {/* Album Art */}
          <div className="aspect-square rounded-lg overflow-hidden mb-6 shadow-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
            <img 
              src="/lovable-uploads/8fe769f4-bcea-4c20-ab31-dbe6174dc510.png"
              alt="3MGODINI"
              className="w-3/4 h-3/4 object-contain filter drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5)) brightness(1.1) contrast(1.2)'
              }}
            />
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
              className="mb-3"
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
              className="w-12 h-12 rounded-full bg-primary text-black hover:bg-primary/90 hover:scale-105 flex items-center justify-center transition-all duration-200"
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
              className="flex-1"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          <div className="spotify-card p-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full bg-primary text-black hover:bg-primary/90 font-semibold py-3 text-base rounded-full border-0"
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
            Powered by <span className="text-primary">3MGODINI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
