
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Home, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MobileMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'podcast', label: 'Podcast', icon: Radio, path: '/podcast' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/stance' },
    { id: 'private-rooms', label: 'Private Rooms', icon: Users, path: '/private-rooms' },
  ];

  const secondaryTabs = [
    { id: 'umgosi', label: 'Umgosi', icon: MessageCircle, path: '/dashboard' },
    { id: 'stoko', label: 'Stoko', icon: Camera, path: '/dashboard' },
    { id: 'hustlers', label: 'Hustlers Nje', icon: Briefcase, path: '/dashboard' },
    { id: 'styla', label: 'Styla Samahala', icon: Mic, path: '/dashboard' },
    { id: 'umdantso', label: 'Umdantso Kuphela', icon: Zap, path: '/dashboard' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden text-gray-300 hover:text-orange-400"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 py-4 border-t border-orange-500/30 bg-gray-900/90 backdrop-blur-sm animate-fade-in z-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-2">
              {[...mainTabs, ...secondaryTabs].map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                  onClick={() => {
                    navigate(tab.path);
                    setIsMenuOpen(false);
                  }}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 col-span-2"
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                  <Badge variant="secondary" className="ml-2 bg-orange-600 text-white text-xs">
                    ADMIN
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
