
import { Button } from '@/components/ui/button';
import { Car, Headphones, Radio, Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'podcast', label: 'Podcast', icon: Radio, path: '/podcast' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/stance' },
    { id: 'private-rooms', label: 'Private Rooms', icon: Users, path: '/private-rooms' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-t border-orange-500/30 shadow-lg">
      <div className="grid grid-cols-5 py-2">
        {mainTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
            onClick={() => navigate(tab.path)}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{tab.label.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
