import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Music, Users, Calendar, Sparkles } from 'lucide-react';
import GigFeed from '@/components/GigFeed';
import ArtistProfileCreator from '@/components/ArtistProfileCreator';
import ArtistProfileFeed from '@/components/ArtistProfileFeed';
import AdManager from '@/components/AdManager';
import UserPointsDisplay from '@/components/UserPointsDisplay';
import { useAuth } from '@/hooks/useAuth';

const Groovist = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Groovist - Music Events & Gig Advertising | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover and advertise music events, gigs, and concerts in your area. Connect with artists, venues, and music lovers in the Groovist community.');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/groovist');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Groovist - Music Events & Gig Advertising",
      "description": "Discover and advertise music events, gigs, and concerts in your area. Connect with artists, venues, and music lovers.",
      "url": window.location.origin + '/groovist',
      "mainEntity": {
        "@type": "MusicEvent",
        "name": "Groovist Community",
        "description": "Music events and gig advertising platform for artists and music lovers",
        "image": window.location.origin + "/assets/groovist-bg.jpg"
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                <Music className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Groovist 🎵
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The ultimate platform for music events, gig advertising, and connecting artists with their audience. 
              Discover live music, promote your shows, and groove with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3">
                <Calendar className="mr-2 h-5 w-5" />
                Find Events
              </Button>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-3">
                <Sparkles className="mr-2 h-5 w-5" />
                Promote Your Gig
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
            pageSlug="groovist" 
            adType="banner" 
            maxAds={1}
            showCloseButton={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Gig Feed */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Music Events & Gigs 🎤
              </h2>
              <p className="text-gray-400 text-lg">
                Discover upcoming shows, advertise your events, and connect with the music community
              </p>
            </div>
            
            <GigFeed />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Ad */}
            <AdManager 
              pageSlug="groovist" 
              adType="card" 
              maxAds={1}
              showCloseButton={true}
            />

            {/* Community Stats */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Events</span>
                  <span className="text-purple-400 font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Artists</span>
                  <span className="text-purple-400 font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Venues</span>
                  <span className="text-purple-400 font-semibold">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-purple-400 font-semibold">89 Events</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                💡 Pro Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• Post your gigs at least 2 weeks in advance</p>
                <p>• Include high-quality event posters</p>
                <p>• Add venue details and ticket information</p>
                <p>• Engage with your audience in comments</p>
                <p>• Share on social media for more reach</p>
              </div>
            </div>

            {/* Sponsored Post Ad */}
            <AdManager 
              pageSlug="groovist" 
              adType="sponsored_post" 
              maxAds={1}
              showCloseButton={true}
            />
          </div>
        </div>

        {/* Artist Profiles Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Groovist Artists 🎤
            </h2>
            <p className="text-gray-400 text-lg">Discover and connect with talented artists and performers</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ArtistProfileFeed showCreator={true} />
          </div>
        </div>

        {/* Featured Events Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Events ⭐
            </h2>
            <p className="text-gray-400 text-lg">Don't miss these highlighted shows and performances</p>
          </div>
          
          {/* This could be enhanced to show only featured gigs */}
          <div className="bg-gray-900/50 backdrop-blur-md border border-purple-500/20 rounded-lg p-8 text-center">
            <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-400">Featured events will be highlighted here based on promotion and community engagement.</p>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-16 bg-gray-900/50 backdrop-blur-md border border-purple-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Community Guidelines 📋
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-3">✅ Do's</h3>
              <ul className="space-y-2 text-sm">
                <li>• Post legitimate music events only</li>
                <li>• Provide accurate event details</li>
                <li>• Respect other artists and venues</li>
                <li>• Support local music scene</li>
                <li>• Keep content music-related</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">❌ Don'ts</h3>
              <ul className="space-y-2 text-sm">
                <li>• Post spam or fake events</li>
                <li>• Use offensive language</li>
                <li>• Promote illegal activities</li>
                <li>• Copy other people's events</li>
                <li>• Share personal information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groovist;

