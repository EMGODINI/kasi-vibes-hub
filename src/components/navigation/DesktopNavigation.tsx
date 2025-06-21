
import { Button } from '@/components/ui/button';
import { Car, Headphones, Radio, Users, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DesktopNavigation = () => {
  const navigate = useNavigate();

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'podcast', label: 'Podcast', icon: Radio, path: '/podcast' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/stance' },
    { id: 'private-rooms', label: 'Private Rooms', icon: Users, path: '/private-rooms' },
  ];

  return (
    <div className="hidden lg:flex items-center space-x-1">
      {mainTabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
          onClick={() => navigate(tab.path)}
        >
          <tab.icon className="w-4 h-4 mr-1" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default DesktopNavigation;
