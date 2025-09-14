
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WelcomeAudioProps {
  shouldPlay?: boolean;
  onComplete?: () => void;
}

const WelcomeAudio = ({ shouldPlay = false, onComplete }: WelcomeAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          toast({
            title: "🎵 Welcome to 3MGODINI! 🎵",
            description: "Enjoy this welcome track as you join the kasi family!",
          });
        } catch (error) {
          console.log('Audio autoplay blocked:', error);
          // Fallback: show a button to manually play
          toast({
            title: "🎵 Welcome! 🎵",
            description: "Click here to play your welcome track!",
            action: (
              <button 
                onClick={() => audioRef.current?.play()}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
              >
                Play Track
              </button>
            ),
          });
        }
      };

      playAudio();
    }
  }, [shouldPlay, toast]);

  const handleEnded = () => {
    onComplete?.();
  };

  return (
    <audio
      ref={audioRef}
      onEnded={handleEnded}
      preload="auto"
      className="hidden"
    >
      {/* You can replace this with your actual welcome track URL */}
      <source src="/welcome-track.mp3" type="audio/mpeg" />
      <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
    </audio>
  );
};

export default WelcomeAudio;
