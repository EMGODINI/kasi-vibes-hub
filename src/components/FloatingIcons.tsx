
import { Headphones, Mic, Disc3, Square, Circle, Car } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [
    { Icon: Headphones, delay: '0s', left: '10%', top: '20%', size: 'w-8 h-8', duration: '8s' },
    { Icon: Mic, delay: '2s', left: '85%', top: '60%', size: 'w-6 h-6', duration: '6s' },
    { Icon: Disc3, delay: '1s', left: '15%', top: '70%', size: 'w-10 h-10', duration: '10s' },
    { Icon: Square, delay: '3s', left: '75%', top: '25%', size: 'w-7 h-7', duration: '7s' },
    { Icon: Circle, delay: '4s', left: '5%', top: '50%', size: 'w-9 h-9', duration: '9s' },
    { Icon: Car, delay: '5s', left: '90%', top: '15%', size: 'w-8 h-8', duration: '8s' },
    { Icon: Disc3, delay: '6s', left: '25%', top: '85%', size: 'w-6 h-6', duration: '11s' },
    { Icon: Headphones, delay: '7s', left: '60%', top: '80%', size: 'w-7 h-7', duration: '6s' },
    { Icon: Circle, delay: '8s', left: '40%', top: '30%', size: 'w-5 h-5', duration: '12s' },
    { Icon: Square, delay: '9s', left: '70%', top: '75%', size: 'w-8 h-8', duration: '9s' },
    { Icon: Mic, delay: '10s', left: '30%', top: '10%', size: 'w-9 h-9', duration: '7s' },
    { Icon: Car, delay: '11s', left: '50%', top: '90%', size: 'w-6 h-6', duration: '10s' },
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
