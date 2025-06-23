
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Headphones, Radio, Users, Home } from 'lucide-react';
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
    return Home;
  };

  return (
    <div className="hidden lg:flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
        onClick={() => navigate('/dashboard')}
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Button>
      
      {pages.map((page) => {
        const IconComponent = getIcon(page.name);
        return (
          <Button
            key={page.id}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
            onClick={() => navigate(`/page/${page.slug}`)}
          >
            <IconComponent className="w-4 h-4 mr-1" />
            {page.title}
          </Button>
        );
      })}
    </div>
  );
};

export default DesktopNavigation;
