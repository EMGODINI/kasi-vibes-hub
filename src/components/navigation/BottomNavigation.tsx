
import { Home, Radio, Car, Video, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Radio, label: 'Podcast', path: '/podcast' },
    { icon: Car, label: 'Stance', path: '/stance' },
    { icon: Video, label: 'Reels', path: '/reels' },
    { icon: Users, label: 'Rooms', path: '/private-rooms' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 text-xs px-3 py-2 h-auto ${
                isActive 
                  ? 'text-orange-500 bg-orange-500/10' 
                  : 'text-gray-400 hover:text-orange-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
