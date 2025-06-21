
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Home, User, Settings, Menu, X, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navigation = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'podcast', label: 'Podcast', icon: Radio, path: '/podcast' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/dashboard' },
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
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-orange-500/30 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/924af0ae-dd6b-494b-a23c-37583952b3e8.png" 
                  alt="3MGODINI Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent font-orbitron">
                3MGODINI
              </span>
            </div>

            {/* Desktop Navigation */}
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

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                  <Badge variant="secondary" className="ml-1 bg-orange-600 text-white text-xs">
                    ADMIN
                  </Badge>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-orange-400"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-orange-400"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-300 hover:text-orange-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-orange-500/30 bg-gray-900/90 backdrop-blur-sm animate-fade-in">
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
          )}
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
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

      {/* Secondary Navigation Tabs */}
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
    </>
  );
};

export default Navigation;
