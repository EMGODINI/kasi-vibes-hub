
import NavigationLogo from '@/components/navigation/NavigationLogo';
import DesktopNavigation from '@/components/navigation/DesktopNavigation';
import UserMenu from '@/components/navigation/UserMenu';
import MobileMenu from '@/components/navigation/MobileMenu';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const Navigation = () => {
  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 kasi-glass border-b border-primary/30 shadow-lg animate-shimmer-gold">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            <NavigationLogo />
            <DesktopNavigation />
            <div className="flex items-center space-x-2">
              <UserMenu />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      <BottomNavigation />
    </>
  );
};

export default Navigation;
