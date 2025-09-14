
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Hand } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [username] = useState('User'); // This would come from auth context
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Auto-play welcome track (simulation)
    const playWelcomeTrack = () => {
      setIsPlaying(true);
      // In real implementation, this would play the actual audio file
      console.log('Playing welcome track...');
      
      // Simulate track ending after 10 seconds
      setTimeout(() => {
        setIsPlaying(false);
      }, 10000);
    };

    // Check if this is first time login (would be stored in localStorage/session)
    const isFirstTime = !localStorage.getItem('hasSeenWelcome');
    if (isFirstTime) {
      playWelcomeTrack();
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 enhanced-glass">
        <CardContent className="p-8 text-center">
          {/* Welcome Animation */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg mb-6 animate-scale-in">
              <Hand className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Awe {username}!
            </h1>
            <p className="text-xl text-orange-400 font-semibold mb-4 drop-shadow-md">
              Thatha Lento 👊🏾
            </p>
            <p className="text-gray-300 drop-shadow-sm">
              Welcome to the 3MGodini family! Your vibe, your culture, your space.
            </p>
          </div>

          {/* Music Player Indicator */}
          {isPlaying && (
            <div className="mb-6 p-4 bg-orange-500/20 backdrop-blur-sm rounded-lg animate-fade-in border border-orange-500/30">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-6 bg-orange-400 rounded animate-pulse"></div>
                  <div className="w-2 h-4 bg-orange-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-8 bg-orange-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-3 bg-orange-400 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-orange-200 font-medium">Playing welcome track...</span>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            Enter 3MGodini
          </Button>

          {/* Skip Option */}
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-gray-400 hover:text-orange-400 hover:bg-white/5"
            onClick={() => navigate('/dashboard')}
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
