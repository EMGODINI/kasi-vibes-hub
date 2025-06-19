
import { Headphones, Mic, Disc3, Square, Circle, Car } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [
    // First wave of icons
    { Icon: Headphones, delay: '0s', left: '10%', top: '20%', size: 'w-8 h-8', duration: '8s' },
    { Icon: Mic, delay: '2s', left: '85%', top: '60%', size: 'w-6 h-6', duration: '6s' },
    { Icon: Disc3, delay: '1s', left: '15%', top: '70%', size: 'w-10 h-10', duration: '10s' },
    { Icon: Square, delay: '3s', left: '75%', top: '25%', size: 'w-7 h-7', duration: '7s' },
    { Icon: Circle, delay: '4s', left: '5%', top: '50%', size: 'w-9 h-9', duration: '9s' },
    { Icon: Car, delay: '5s', left: '90%', top: '15%', size: 'w-8 h-8', duration: '8s' },
    
    // Second wave - more scattered
    { Icon: Disc3, delay: '6s', left: '25%', top: '85%', size: 'w-6 h-6', duration: '11s' },
    { Icon: Headphones, delay: '7s', left: '60%', top: '80%', size: 'w-7 h-7', duration: '6s' },
    { Icon: Circle, delay: '8s', left: '40%', top: '30%', size: 'w-5 h-5', duration: '12s' },
    { Icon: Square, delay: '9s', left: '70%', top: '75%', size: 'w-8 h-8', duration: '9s' },
    { Icon: Mic, delay: '10s', left: '30%', top: '10%', size: 'w-9 h-9', duration: '7s' },
    { Icon: Car, delay: '11s', left: '50%', top: '90%', size: 'w-6 h-6', duration: '10s' },
    
    // Third wave - fill more space
    { Icon: Circle, delay: '12s', left: '95%', top: '45%', size: 'w-4 h-4', duration: '8s' },
    { Icon: Square, delay: '13s', left: '20%', top: '5%', size: 'w-5 h-5', duration: '10s' },
    { Icon: Headphones, delay: '14s', left: '80%', top: '90%', size: 'w-6 h-6', duration: '9s' },
    { Icon: Disc3, delay: '15s', left: '3%', top: '80%', size: 'w-8 h-8', duration: '7s' },
    { Icon: Mic, delay: '16s', left: '65%', top: '40%', size: 'w-7 h-7', duration: '11s' },
    { Icon: Car, delay: '17s', left: '45%', top: '65%', size: 'w-5 h-5', duration: '6s' },
    
    // Fourth wave - even more density
    { Icon: Circle, delay: '18s', left: '12%', top: '35%', size: 'w-6 h-6', duration: '12s' },
    { Icon: Square, delay: '19s', left: '88%', top: '70%', size: 'w-4 h-4', duration: '8s' },
    { Icon: Headphones, delay: '20s', left: '35%', top: '95%', size: 'w-9 h-9', duration: '10s' },
    { Icon: Disc3, delay: '21s', left: '72%', top: '8%', size: 'w-5 h-5', duration: '9s' },
    { Icon: Mic, delay: '22s', left: '8%', top: '15%', size: 'w-8 h-8', duration: '7s' },
    { Icon: Car, delay: '23s', left: '93%', top: '85%', size: 'w-7 h-7', duration: '11s' },
    
    // Fifth wave - fill remaining gaps
    { Icon: Circle, delay: '24s', left: '55%', top: '12%', size: 'w-6 h-6', duration: '8s' },
    { Icon: Square, delay: '25s', left: '18%', top: '55%', size: 'w-7 h-7', duration: '10s' },
    { Icon: Headphones, delay: '26s', left: '82%', top: '35%', size: 'w-5 h-5', duration: '9s' },
    { Icon: Disc3, delay: '27s', left: '38%', top: '75%', size: 'w-8 h-8', duration: '12s' },
    { Icon: Mic, delay: '28s', left: '68%', top: '55%', size: 'w-4 h-4', duration: '6s' },
    { Icon: Car, delay: '29s', left: '28%', top: '88%', size: 'w-6 h-6', duration: '8s' },
    
    // Sixth wave - subtle background layer
    { Icon: Circle, delay: '30s', left: '78%', top: '18%', size: 'w-5 h-5', duration: '11s' },
    { Icon: Square, delay: '31s', left: '48%', top: '48%', size: 'w-4 h-4', duration: '7s' },
    { Icon: Headphones, delay: '32s', left: '2%', top: '92%', size: 'w-7 h-7', duration: '9s' },
    { Icon: Disc3, delay: '33s', left: '92%', top: '2%', size: 'w-6 h-6', duration: '10s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, left, top, size, duration }, index) => (
        <div
          key={index}
          className="absolute opacity-10"
          style={{ 
            left,
            top,
            animationDelay: delay,
            animation: `bubble-float ${duration} ease-in-out infinite`
          }}
        >
          <Icon className={`${size} text-orange-400 bubble-icon`} />
        </div>
      ))}
    </div>
  );
};

export default FloatingIcons;
