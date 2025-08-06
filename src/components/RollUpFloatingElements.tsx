import React from 'react';
import { Headphones, Mic, Circle, Square, Car } from 'lucide-react';

const floatingElements = [
  {
    Icon: Headphones,
    delay: '0s',
    left: '10%',
    top: '20%',
    size: 'h-6 w-6',
    duration: '8s',
  },
  {
    Icon: Mic,
    delay: '2s',
    left: '80%',
    top: '15%',
    size: 'h-5 w-5',
    duration: '10s',
  },
  {
    Icon: Circle,
    delay: '1s',
    left: '20%',
    top: '60%',
    size: 'h-4 w-4',
    duration: '12s',
  },
  {
    Icon: Square,
    delay: '3s',
    left: '70%',
    top: '70%',
    size: 'h-5 w-5',
    duration: '9s',
  },
  {
    Icon: Car,
    delay: '4s',
    left: '60%',
    top: '30%',
    size: 'h-6 w-6',
    duration: '11s',
  },
  {
    Icon: Headphones,
    delay: '5s',
    left: '40%',
    top: '80%',
    size: 'h-4 w-4',
    duration: '7s',
  },
  {
    Icon: Circle,
    delay: '1.5s',
    left: '90%',
    top: '50%',
    size: 'h-3 w-3',
    duration: '13s',
  },
  {
    Icon: Mic,
    delay: '6s',
    left: '15%',
    top: '40%',
    size: 'h-5 w-5',
    duration: '10s',
  },
];

const RollUpFloatingElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dreamy fog background layer */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'var(--gradient-dreamy-fog)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Floating elements */}
      {floatingElements.map((element, index) => {
        const { Icon, delay, left, top, size, duration } = element;
        
        return (
          <div
            key={index}
            className={`absolute ${size} text-roll-up-ultraviolet animate-dreamy-float`}
            style={{
              left,
              top,
              animationDelay: delay,
              animationDuration: duration,
              opacity: 0.1,
            }}
          >
            <Icon className="w-full h-full" />
          </div>
        );
      })}
      
      {/* Additional geometric shapes */}
      <div
        className="absolute w-8 h-8 bg-roll-up-neon-green rounded-full animate-dreamy-float"
        style={{
          left: '50%',
          top: '10%',
          animationDelay: '7s',
          animationDuration: '15s',
          opacity: 0.08,
        }}
      />
      
      <div
        className="absolute w-6 h-6 bg-roll-up-hazy-magenta rotate-45 animate-dreamy-float"
        style={{
          left: '30%',
          top: '90%',
          animationDelay: '3.5s',
          animationDuration: '11s',
          opacity: 0.06,
        }}
      />
      
      <div
        className="absolute w-4 h-4 bg-roll-up-deep-purple rounded-full animate-dreamy-float"
        style={{
          left: '85%',
          top: '80%',
          animationDelay: '8s',
          animationDuration: '9s',
          opacity: 0.1,
        }}
      />
    </div>
  );
};

export default RollUpFloatingElements;