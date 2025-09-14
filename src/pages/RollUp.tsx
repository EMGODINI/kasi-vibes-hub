
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Leaf, Sparkles, Music, Users, MessageSquare } from 'lucide-react';
import ForumFeed from '@/components/ForumFeed';
import AdManager from '@/components/AdManager';
import { PagePlaylist } from '@/components/playlist/PagePlaylist';
import RollUpFloatingElements from '@/components/RollUpFloatingElements';
import DailyStickyContent from '@/components/DailyStickyContent';
import WhatYouRollin from '@/components/WhatYouRollin';
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer';
import UserPointsDisplay from '@/components/UserPointsDisplay';
import { useAuth } from '@/hooks/useAuth';

const RollUp = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Roll Up - Chill Community Vibes | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join the Roll Up community for chill vibes, laid-back content, and relaxed social connections. Share your moments and discover amazing playlists.');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/roll-up');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Roll Up - Chill Community",
      "description": "Join the Roll Up community for chill vibes, laid-back content, and relaxed social connections.",
      "url": window.location.origin + '/roll-up',
      "mainEntity": {
        "@type": "SocialMediaPosting",
        "headline": "Roll Up Community",
        "description": "A relaxed community space for sharing moments and discovering music",
        "image": window.location.origin + "/assets/roll-up-hero.jpg"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "3MGodini",
        "url": window.location.origin
      }
    };
    
    // Remove existing structured data script if any
    const existingScript = document.querySelector('script[type="application/ld+json"][data-page="roll-up"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'roll-up');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-page="roll-up"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />
      <RollUpFloatingElements />
      <BackgroundMusicPlayer />
      
      {/* Hero Section with Dreamy Fog */}
      <div 
        className="relative h-[70vh] overflow-hidden"
        style={{
          background: 'var(--gradient-roll-up)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-roll-up-dream-fog/30 to-transparent" />
        
        {/* Graffiti-style 3MGODINI background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="text-[20rem] font-black text-roll-up-ultraviolet transform rotate-12 select-none">
            3MGODINI
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/lovable-uploads/34e408d9-19c9-4504-bbb7-9796f77f60f6.png" 
                alt="Roll Up Cannabis Leaf Logo" 
                className="w-32 h-32 mb-4 animate-roll-up-glow"
              />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent animate-cyber-glow">
                Roll Up
              </h1>
            </div>
            <p className="text-xl mb-8 text-roll-up-hazy-magenta">
              Where the vibes meet the clouds - Join the ultimate chill community
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80 animate-roll-up-glow">
                <img src="/lovable-uploads/34e408d9-19c9-4504-bbb7-9796f77f60f6.png" alt="Cannabis" className="mr-2 h-4 w-4" />
                Light It Up
              </Button>
              <Button variant="outline" className="border-roll-up-ultraviolet text-roll-up-ultraviolet hover:bg-roll-up-ultraviolet/10">
                <Sparkles className="mr-2 h-4 w-4" />
                Enter the Zone
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* User Points Display for authenticated users */}
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
            pageSlug="roll-up" 
            adType="banner" 
            maxAds={1}
            showCloseButton={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <DailyStickyContent />
            {/* Sidebar Ad */}
            <div className="mt-6">
              <AdManager 
                pageSlug="roll-up" 
                adType="card" 
                maxAds={1}
                showCloseButton={true}
              />
            </div>
          </div>
          
          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            <WhatYouRollin />

            {/* Discussion Forum */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
                Community Discussions 💬
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Share your thoughts, ask questions, and connect with fellow enthusiasts.
              </p>
              <ForumFeed forumSlug="roll-up-discussions" />
            </div>
          </div>
        </div>

        {/* Music Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
              High Tracks Only 🎵
            </h2>
            <p className="text-roll-up-hazy-magenta text-lg">
              Curated beats for the perfect session
            </p>
          </div>
          
          <div className="glass-tile rounded-2xl p-8 max-w-4xl mx-auto">
            <PagePlaylist pageSlug="roll-up" className="w-full" />
          </div>
        </div>

        {/* Community Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <Users className="h-12 w-12 mx-auto mb-4 text-roll-up-neon-green" />
            <h3 className="text-2xl font-bold text-roll-up-ultraviolet mb-2">3.2K+</h3>
            <p className="text-roll-up-hazy-magenta">Rolling Together</p>
          </div>
          
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <img src="/lovable-uploads/34e408d9-19c9-4504-bbb7-9796f77f60f6.png" alt="Cannabis" className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-roll-up-neon-green mb-2">15K+</h3>
            <p className="text-roll-up-hazy-magenta">Sessions Shared</p>
          </div>
          
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <Music className="h-12 w-12 mx-auto mb-4 text-roll-up-hazy-magenta" />
            <h3 className="text-2xl font-bold text-roll-up-ultraviolet mb-2">500+</h3>
            <p className="text-roll-up-hazy-magenta">Chill Playlists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollUp;
