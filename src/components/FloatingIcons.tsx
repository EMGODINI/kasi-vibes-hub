
import { Headphones, Mic, Vinyl, Square, Circle, Triangle } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [
    { Icon: Headphones, delay: '0s', left: '10%', size: 'w-8 h-8' },
    { Icon: Mic, delay: '1s', left: '85%', size: 'w-6 h-6' },
    { Icon: Vinyl, delay: '2s', left: '15%', size: 'w-10 h-10' },
    { Icon: Square, delay: '3s', left: '75%', size: 'w-7 h-7' },
    { Icon: Circle, delay: '4s', left: '5%', size: 'w-9 h-9' },
    { Icon: Triangle, delay: '5s', left: '90%', size: 'w-8 h-8' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, left, size }, index) => (
        <div
          key={index}
          className="absolute top-20 opacity-20"
          style={{ 
            left,
            animationDelay: delay,
            animation: 'float 6s ease-in-out infinite alternate'
          }}
        >
          <Icon className={`${size} text-orange-500 floating-icon`} />
        </div>
      ))}
    </div>
  );
};

export default FloatingIcons;
