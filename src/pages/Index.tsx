import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState([75]);

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
    <div className="min-h-screen" style={{
      background: 'hsl(220, 13%, 18%)',
      color: 'hsl(0, 0%, 95%)'
    }}>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-sm mx-auto">
          {/* Main Glass Card */}
          <div 
            className="p-6 mb-6 rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Golden 3MG Logo */}
            <div 
              className="aspect-square rounded-xl mb-6 flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #000000, #1a1a1a)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
              }}
            >
              <div 
                className="text-8xl font-black tracking-wider"
                style={{
                  color: '#FFD700',
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                }}
              >
                3MG
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-6">
              <p 
                className="text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                3MGODINI • DIGITAL SOUP
              </p>
              <h1 className="text-lg font-bold mb-3 leading-tight text-white">
                Welcome to the Community
              </h1>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                Awe mfwethu! Connect with your people and share your stance 🔥
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="relative mb-3">
                <div 
                  className="w-full h-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{
                      background: '#22c55e',
                      width: `${(currentTime / duration) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div 
                className="flex justify-between text-xs font-mono"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 flex items-center justify-center"
                style={{
                  background: '#22c55e',
                  color: '#000000'
                }}
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
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 mb-6">
              <Volume2 
                className="h-4 w-4 flex-shrink-0"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              />
              <div className="flex-1 relative">
                <div 
                  className="w-full h-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <div 
                    className="h-full rounded-full"
                    style={{
                      background: '#22c55e',
                      width: `${volume[0]}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-3">
            <div 
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full font-semibold py-3 text-base rounded-full border-0 text-black hover:opacity-90"
                style={{ background: '#22c55e' }}
              >
                Join the Community
              </Button>
            </div>
            
            <div 
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full text-white hover:bg-white/10 hover:border-white/30 rounded-full py-3 bg-transparent"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                Browse as Guest
              </Button>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="text-center mt-6">
            <p 
              className="text-xs font-medium"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Powered by <span style={{ color: '#22c55e' }}>3MGODINI</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;