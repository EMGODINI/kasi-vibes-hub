
import { useState, useEffect } from 'react';
import { Home, Radio, Car, Video, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  icon_url?: string;
}

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        .order('order_index', { ascending: true })
        .limit(4); // Show only first 4 pages in bottom nav

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
    if (name.includes('room') || name.includes('private')) return Users;
    if (name.includes('reel') || name.includes('video')) return Video;
    return Home;
  };

  const getLabel = (title: string) => {
    // Shorten long titles for bottom nav
    if (title.length > 8) {
      return title.split(' ')[0];
    }
    return title;
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Video, label: 'Reels', path: '/reels' },
    { icon: Radio, label: 'Roll Up', path: '/roll-up' },
    { icon: Car, label: 'Skate', path: '/skaters-street' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 md:hidden shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 text-xs px-3 py-2 h-auto transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
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
