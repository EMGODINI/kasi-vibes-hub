import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Activity, Users, Music, Sparkles } from 'lucide-react';
import RollUpFloatingElements from '@/components/RollUpFloatingElements';
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer';
import DailyStickyContent from '@/components/DailyStickyContent';
import WhatYouRollin from '@/components/WhatYouRollin';
import UserPointsDisplay from '@/components/UserPointsDisplay';
import { PagePlaylist } from '@/components/playlist/PagePlaylist';
import PostFeed from '@/components/PostFeed';
import SkateSpotFeed from '@/components/SkateSpotFeed';
import TrickVideoFeed from '@/components/TrickVideoFeed';
import AdManager from '@/components/AdManager';
import { useAuth } from '@/hooks/useAuth';

const SkatersStreet = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Skaters Street - Urban Skateboarding Community | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join Skaters Street - the ultimate urban skateboarding community. Share clips, discover street beats, and connect with skaters worldwide.');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/skaters-street');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Skaters Street - Urban Skateboarding Community",
      "description": "Join Skaters Street - the ultimate urban skateboarding community. Share clips, discover street beats, and connect with skaters worldwide.",
      "url": window.location.origin + '/skaters-street',
      "mainEntity": {
        "@type": "SportsEvent",
        "name": "Skaters Street Community",
        "description": "Urban skateboarding community for sharing clips and connecting with skaters",
        "sport": "Skateboarding",
        "image": window.location.origin + "/assets/skaters-street-bg.jpg"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "3MGodini",
        "url": window.location.origin
      }
    };
    
    // Remove existing structured data script if any
    const existingScript = document.querySelector('script[type="application/ld+json"][data-page="skaters-street"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'skaters-street');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-page="skaters-street"]');
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

      {/* Hero */}
      <div
        className="relative h-[70vh] overflow-hidden"
        style={{ background: 'var(--gradient-roll-up)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-roll-up-dream-fog/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="text-[18rem] md:text-[20rem] font-black text-roll-up-ultraviolet transform -rotate-6 select-none">
            SKATE
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent animate-cyber-glow">
              Skaters Street 🛹
            </h1>
            <p className="text-xl mb-8 text-roll-up-hazy-magenta">
              Roll smooth. Share clips. Vibe with the crew.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet hover:opacity-80 animate-roll-up-glow">
                <Activity className="mr-2 h-4 w-4" />
                Drop In
              </Button>
              <Button variant="outline" className="border-roll-up-ultraviolet text-roll-up-ultraviolet hover:bg-roll-up-ultraviolet/10">
                <Sparkles className="mr-2 h-4 w-4" />
                Discover Lines
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
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
            pageSlug="skaters-street" 
            adType="banner" 
            maxAds={1}
            showCloseButton={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DailyStickyContent />
            
            {/* Sidebar Ad */}
            <div className="mt-6">
              <AdManager 
                pageSlug="skaters-street" 
                adType="card" 
                maxAds={1}
                showCloseButton={true}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <WhatYouRollin />
          </div>
        </div>

        {/* Community Posts */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
              Skaters Community 🛹
            </h2>
            <p className="text-roll-up-hazy-magenta text-lg">Share your tricks, spots, and skate stories</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <PostFeed pageSlug="skaters-street" />
          </div>
        </div>

        {/* Skate Spots */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
              Skate Spots 📍
            </h2>
            <p className="text-roll-up-hazy-magenta text-lg">Discover and share the sickest spots in your area</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <SkateSpotFeed />
          </div>
        </div>

        {/* Trick Videos */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
              Trick Library 🎥
            </h2>
            <p className="text-roll-up-hazy-magenta text-lg">Master new tricks or share your own!</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <TrickVideoFeed showCreator={true} />
          </div>
        </div>

        {/* Music */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-roll-up-neon-green to-roll-up-ultraviolet bg-clip-text text-transparent">
              Street Beats 🎵
            </h2>
            <p className="text-roll-up-hazy-magenta text-lg">Tracks to push, pop, and flow</p>
          </div>
          <div className="glass-tile rounded-2xl p-8 max-w-4xl mx-auto">
            <PagePlaylist pageSlug="skaters-street" className="w-full" />
          </div>
        </div>

        {/* Crew Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <Users className="h-12 w-12 mx-auto mb-4 text-roll-up-neon-green" />
            <h3 className="text-2xl font-bold text-roll-up-ultraviolet mb-2">1.2K+</h3>
            <p className="text-roll-up-hazy-magenta">Skaters Rolling</p>
          </div>
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <Activity className="h-12 w-12 mx-auto mb-4 text-roll-up-ultraviolet" />
            <h3 className="text-2xl font-bold text-roll-up-neon-green mb-2">8K+</h3>
            <p className="text-roll-up-hazy-magenta">Clips Shared</p>
          </div>
          <div className="glass-tile p-6 text-center animate-roll-up-glow">
            <Music className="h-12 w-12 mx-auto mb-4 text-roll-up-hazy-magenta" />
            <h3 className="text-2xl font-bold text-roll-up-ultraviolet mb-2">250+</h3>
            <p className="text-roll-up-hazy-magenta">Playlists Dropped</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkatersStreet;
