
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Home, User, Settings, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'die-stance', label: 'Die Stance', icon: Car, path: '/dashboard' },
    { id: 'umgosi', label: 'Umgosi', icon: MessageCircle, path: '/dashboard' },
    { id: 'stoko', label: 'Stoko', icon: Camera, path: '/dashboard' },
    { id: 'hustlers', label: 'Hustlers Nje', icon: Briefcase, path: '/dashboard' },
  ];

  const secondaryTabs = [
    { id: 'styla', label: 'Styla Samahala', icon: Mic, path: '/dashboard' },
    { id: 'umdantso', label: 'Umdantso Kuphela', icon: Zap, path: '/dashboard' },
    { id: 'siya-pheka', label: 'Siya Pheka', icon: Headphones, path: '/dashboard' },
    { id: 'live-mix', label: 'Live Mix', icon: Radio, path: '/dashboard' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3MG</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                3MGodini
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {mainTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => navigate(tab.path)}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-orange-600"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-orange-600"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-orange-100 bg-white/90 backdrop-blur-sm animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                {[...mainTabs, ...secondaryTabs].map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      navigate(tab.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-orange-100 shadow-lg">
        <div className="grid grid-cols-5 py-2">
          {mainTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-2 text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Secondary Navigation Tabs */}
      <div className="hidden lg:block bg-white/50 backdrop-blur-sm border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 py-2 overflow-x-auto">
            {secondaryTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className="whitespace-nowrap text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                onClick={() => navigate(tab.path)}
              >
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
