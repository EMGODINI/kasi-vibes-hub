
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

const UserMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
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
    </div>
  );
};

export default UserMenu;
