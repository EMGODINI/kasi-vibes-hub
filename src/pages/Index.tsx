
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
    <div className="dark min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Album Art / Main Image */}
        <div className="relative mb-8">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
            <img 
              src="/lovable-uploads/8fe769f4-bcea-4c20-ab31-dbe6174dc510.png"
              alt="3MGODINI"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm mb-2 font-medium">
            3MGodini • Community
          </p>
          <h1 className="text-white text-xl font-bold mb-4">
            Welcome to the Digital Soup
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Awe mfwethu! Connect with your people and share your stance in the culture 🔥
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => setCurrentTime(value)}
            max={duration}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-white"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-white"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 mb-8">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full bg-white text-black hover:bg-white/90 font-medium py-3 text-base rounded-full"
          >
            Join the Community
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="w-full border-white/20 text-white hover:bg-white/10 rounded-full py-3"
          >
            Browse as Guest
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Powered by 3MGODINI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
