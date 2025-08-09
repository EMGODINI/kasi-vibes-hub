
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Car, MessageCircle, Camera, Briefcase, Mic, Zap, Headphones, Radio, Home, Users, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  icon_url?: string;
}

const MobileMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pages, setPages] = useState<AppPage[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('app_pages')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const getIcon = (pageName: string) => {
    const name = pageName.toLowerCase();
    if (name.includes('podcast')) return Radio;
    if (name.includes('stance') || name.includes('car')) return Car;
    if (name.includes('siya') || name.includes('music')) return Headphones;
    if (name.includes('room') || name.includes('private')) return Users;
    if (name.includes('umgosi') || name.includes('gossip')) return MessageCircle;
    if (name.includes('stoko') || name.includes('photo')) return Camera;
    if (name.includes('hustlers') || name.includes('business')) return Briefcase;
    if (name.includes('styla') || name.includes('style')) return Mic;
    if (name.includes('umdantso') || name.includes('dance')) return Zap;
    return Home;
  };

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
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                onClick={() => {
                  navigate('/dashboard');
                  setIsMenuOpen(false);
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                onClick={() => {
                  navigate('/skaters-street');
                  setIsMenuOpen(false);
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Skaters Street
              </Button>
              
              {pages.map((page) => {
                const IconComponent = getIcon(page.name);
                return (
                  <Button
                    key={page.id}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                    onClick={() => {
                      navigate(`/page/${page.slug}`);
                      setIsMenuOpen(false);
                    }}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {page.title}
                  </Button>
                );
              })}
              
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
