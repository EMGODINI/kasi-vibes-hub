
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Headphones, Radio, Users, Home, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AppPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  icon_url?: string;
}

const DesktopNavigation = () => {
  const navigate = useNavigate();
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
        .limit(4); // Show only first 4 pages in desktop nav

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
    if (name.includes('azishe') || name.includes('ngama')) return Users;
    return Home;
  };

  return (
    <div className="hidden lg:flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/80 hover:text-neon-purple hover:bg-neon-purple/10 transition-all duration-300 hover:shadow-neon hover:scale-105 relative group"
        onClick={() => navigate('/dashboard')}
      >
        <Home className="w-4 h-4 mr-1 group-hover:animate-pulse" />
        Home
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/80 hover:text-roll-up-neon-green hover:bg-roll-up-neon-green/10 transition-all duration-300 hover:shadow-glow hover:scale-105 relative group"
        onClick={() => navigate('/roll-up')}
      >
        <Activity className="w-4 h-4 mr-1 group-hover:animate-pulse" />
        Roll Up 🌿
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/80 hover:text-neon-pink hover:bg-neon-pink/10 transition-all duration-300 hover:shadow-glow hover:scale-105 relative group"
        onClick={() => navigate('/skaters-street')}
      >
        <Activity className="w-4 h-4 mr-1 group-hover:animate-pulse" />
        Skaters Street
      </Button>
      
      {pages.map((page) => {
        const IconComponent = getIcon(page.name);
        return (
          <Button
            key={page.id}
            variant="ghost"
            size="sm"
            className="text-foreground/80 hover:text-electric-blue hover:bg-electric-blue/10 transition-all duration-300 hover:shadow-glow hover:scale-105 relative group"
            onClick={() => navigate(`/page/${page.slug}`)}
          >
            <IconComponent className="w-4 h-4 mr-1 group-hover:animate-pulse" />
            {page.title}
          </Button>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
