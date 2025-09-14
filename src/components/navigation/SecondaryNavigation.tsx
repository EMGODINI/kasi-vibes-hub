
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Camera, Briefcase, Mic, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SecondaryNavigation = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const secondaryTabs = [
    { id: 'umgosi', label: 'Umgosi', icon: MessageCircle, path: '/dashboard' },
    { id: 'stoko', label: 'Stoko', icon: Camera, path: '/dashboard' },
    { id: 'hustlers', label: 'Hustlers Nje', icon: Briefcase, path: '/dashboard' },
    { id: 'styla', label: 'Styla Samahala', icon: Mic, path: '/dashboard' },
    { id: 'umdantso', label: 'Umdantso Kuphela', icon: Zap, path: '/dashboard' },
  ];

  return (
    <div className="hidden lg:block bg-gray-800/50 backdrop-blur-sm border-b border-orange-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-2 overflow-x-auto">
          {secondaryTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
            </Button>
          ))}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30"
              onClick={() => navigate('/admin')}
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin Panel
              <Badge variant="secondary" className="ml-1 bg-orange-600 text-white text-xs">
                ADMIN
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavigation;
