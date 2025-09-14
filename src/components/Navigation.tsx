
import NavigationLogo from '@/components/navigation/NavigationLogo';
import DesktopNavigation from '@/components/navigation/DesktopNavigation';
import UserMenu from '@/components/navigation/UserMenu';
import MobileMenu from '@/components/navigation/MobileMenu';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const Navigation = () => {
  return (
    <>
      {/* Spotify-style Glass Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 spotify-glass">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between space-x-8">
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
