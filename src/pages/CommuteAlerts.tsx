import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Car, MapPin, AlertTriangle, Zap } from 'lucide-react';
import CommuteAlertFeed from '@/components/CommuteAlertFeed';
import RouteCreator from '@/components/RouteCreator';
import RouteFeed from '@/components/RouteFeed';
import TransportSchedules from '@/components/TransportSchedules';
import AdManager from '@/components/AdManager';
import UserPointsDisplay from '@/components/UserPointsDisplay';
import { useAuth } from '@/hooks/useAuth';

const CommuteAlerts = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Commute Alerts - Real-time Traffic & Transport | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get real-time commute alerts, traffic updates, and public transport information. Report incidents and help your community navigate the city.');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/commute-alerts');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Commute Alerts - Real-time Traffic & Transport",
      "description": "Get real-time commute alerts, traffic updates, and public transport information. Report incidents and help your community navigate the city.",
      "url": window.location.origin + '/commute-alerts',
      "mainEntity": {
        "@type": "Event",
        "name": "Commute Alert Community",
        "description": "Platform for real-time traffic and transport alerts",
        "image": window.location.origin + "/assets/commute-alerts-bg.jpg"
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
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                <Car className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Commute Alerts 🚨
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get real-time traffic updates, road closures, and public transport delays. 
              Report incidents and help your community navigate the city.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-8 py-3">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report an Alert
              </Button>
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 px-8 py-3">
                <MapPin className="mr-2 h-5 w-5" />
                View Map
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
        <div className="mb-8">
          <AdManager 
            pageSlug="commute-alerts" 
            adType="banner" 
            maxAds={1}
            showCloseButton={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Alert Feed */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Latest Alerts 🚦
              </h2>
              <p className="text-gray-400 text-lg">
                Real-time updates from your community to help you plan your journey
              </p>
            </div>
            
            <CommuteAlertFeed />

            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Share Your Routes 🗺️
                </h2>
                <p className="text-gray-400 text-lg">Plan and share your favorite routes with the community</p>
              </div>
              <RouteCreator />
              <RouteFeed />
            </div>

            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Public Transport Schedules 🚌
                </h2>
                <p className="text-gray-400 text-lg">Check real-time schedules and service updates</p>
              </div>
              <TransportSchedules />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Ad */}
            <AdManager 
              pageSlug="commute-alerts" 
              adType="card" 
              maxAds={1}
              showCloseButton={true}
            />

            {/* Quick Tips */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-red-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                💡 Pro Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• Report incidents as soon as you see them</p>
                <p>• Provide accurate location details</p>
                <p>• Update alerts if conditions change</p>
                <p>• Use the map to visualize affected areas</p>
                <p>• Check alerts before you leave home</p>
              </ul>
            </div>

            {/* Sponsored Post Ad */}
            <AdManager 
              pageSlug="commute-alerts" 
              adType="sponsored_post" 
              maxAds={1}
              showCloseButton={true}
            />
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-16 bg-gray-900/50 backdrop-blur-md border border-red-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Community Guidelines 📋
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-3">✅ Do's</h3>
              <ul className="space-y-2 text-sm">
                <li>• Report accurate and timely information</li>
                <li>• Be specific with locations and details</li>
                <li>• Use appropriate alert types</li>
                <li>• Be respectful in comments</li>
                <li>• Help verify alerts</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">❌ Don'ts</h3>
              <ul className="space-y-2 text-sm">
                <li>• Post false or misleading information</li>
                <li>• Use offensive language</li>
                <li>• Spam the alert feed</li>
                <li>• Report personal disputes</li>
                <li>• Share private information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuteAlerts;

