
import { Button } from '@/components/ui/button';
import { Car, Headphones, Radio, Home, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'podcast', label: 'Podcast', icon: Radio, path: '/podcast' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/stance' },
    { id: 'private-rooms', label: 'Private Rooms', icon: Users, path: '/private-rooms' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 enhanced-glass border-t border-orange-500/30 shadow-2xl">
      <div className="grid grid-cols-5 py-2 px-2">
        {mainTabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-col h-auto py-3 px-2 text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 touch-target transition-all duration-300 spring-bounce",
                active && "text-orange-400 bg-orange-500/10"
              )}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className={cn(
                "w-5 h-5 mb-1 transition-transform duration-200",
                active && "scale-110"
              )} />
              <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
