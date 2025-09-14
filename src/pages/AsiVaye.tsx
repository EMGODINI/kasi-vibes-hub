import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, AlertTriangle, Zap, Navigation as NavigationIcon } from 'lucide-react';
import CommuteAlertFeed from '@/components/CommuteAlertFeed';
import RouteCreator from '@/components/RouteCreator';
import RouteFeed from '@/components/RouteFeed';
import TransportSchedules from '@/components/TransportSchedules';
import UserPointsDisplay from '@/components/UserPointsDisplay';
import { useAuth } from '@/hooks/useAuth';

const AsiVaye = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Asi Vaye - Transport Alerts & Navigation | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Asi Vaye - Your transport companion! Get real-time alerts, schedules, and community-driven navigation help. Let\'s go together!');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/asi-vaye');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Asi Vaye - Transport Alerts & Navigation",
      "description": "Asi Vaye - Your transport companion! Get real-time alerts, schedules, and community-driven navigation help. Let's go together!",
      "url": window.location.origin + '/asi-vaye',
      "mainEntity": {
        "@type": "Service",
        "name": "Asi Vaye Transport Community",
        "description": "Community-driven transport alerts and navigation platform",
        "image": window.location.origin + "/assets/skaters-street-bg.jpg"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "3MGodini",
        "url": window.location.origin
      }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-black via-deep-maroon/20 to-charcoal-black">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-green-600 to-blue-600 shadow-lg">
                <NavigationIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Asi Vaye! 🚌
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your community transport companion! Real-time alerts, schedules, and navigation help. 
              Let's go together and make every journey smoother.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-3">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report Transport Alert
              </Button>
              <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-3">
                <MapPin className="mr-2 h-5 w-5" />
                View Routes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {user && (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-sm">
              <UserPointsDisplay />
            </div>
          </div>
        )}

        {/* Banner Ad */}
        {/* <div className="mb-8">
          <AdManager 
            pageSlug="asi-vaye" 
            adType="banner" 
            maxAds={1}
            showCloseButton={true}
          />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Alert Feed */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Community Transport Alerts 🚨
              </h2>
              <p className="text-gray-400 text-lg">
                Real-time updates from fellow commuters to help you plan your journey
              </p>
            </div>
            
            <CommuteAlertFeed />

            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Share Your Routes 🛤️
                </h2>
                <p className="text-gray-400 text-lg">Create and share transport routes with your community</p>
              </div>
              <RouteCreator />
              <RouteFeed />
            </div>

            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Public Transport Schedules 🕐
                </h2>
                <p className="text-gray-400 text-lg">Check real-time schedules and service updates</p>
              </div>
              <TransportSchedules />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Ad */}
            {/* <AdManager 
              pageSlug="asi-vaye" 
              adType="card" 
              maxAds={1}
              showCloseButton={true}
            /> */}

            {/* Transport Tips */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                🚍 Travel Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>Check alerts before leaving home</li>
                <li>Share route updates to help others</li>
                <li>Keep transport cards topped up</li>
                <li>Have backup route options ready</li>
                <li>Report delays and disruptions</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                🔗 Quick Links
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-blue-400 hover:bg-blue-500/10">
                  <Bus className="mr-2 h-4 w-4" />
                  Bus Routes
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-green-400 hover:bg-green-500/10">
                  <MapPin className="mr-2 h-4 w-4" />
                  Train Schedules
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-yellow-400 hover:bg-yellow-500/10">
                  <Zap className="mr-2 h-4 w-4" />
                  Taxi Ranks
                </Button>
              </div>
            </div>

            {/* Sponsored Post Ad */}
            {/* <AdManager 
              pageSlug="asi-vaye" 
              adType="sponsored_post" 
              maxAds={1}
              showCloseButton={true}
            /> */}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-16 bg-gray-900/50 backdrop-blur-md border border-green-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Asi Vaye Community Guidelines 📋
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-3">✅ Help Your Community</h3>
              <ul className="space-y-2 text-sm">
                <li>• Share accurate transport updates</li>
                <li>• Be specific with location details</li>
                <li>• Update alerts when situations change</li>
                <li>• Be respectful and helpful</li>
                <li>• Verify information before sharing</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">❌ Keep It Clean</h3>
              <ul className="space-y-2 text-sm">
                <li>• Don't share false information</li>
                <li>• Avoid offensive language</li>
                <li>• Don't spam the community</li>
                <li>• No personal disputes</li>
                <li>• Respect privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsiVaye;