import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Users, MessageCircle, Music } from 'lucide-react';

const WhatIs3MGodini = () => {
  const features = [
    {
      icon: Music,
      title: "Kasi Sounds",
      description: "Discover and share the latest tracks from the streets"
    },
    {
      icon: Users,
      title: "Voice Rooms",
      description: "Join live conversations with your community"
    },
    {
      icon: Play,
      title: "Reels & Vibes",
      description: "Short-form content that captures the culture"
    },
    {
      icon: MessageCircle,
      title: "Chat Spaces",
      description: "Connect with friends and make new ones"
    }
  ];

  return (
    <Card className="clean-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground mb-2">
          What's 3MGODINI?
        </CardTitle>
        <p className="text-muted-foreground">
          Awe mfwethu, here's what's hot in the streets 🔥
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-300">
            🔥 Join the Vibe
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-sm">
              🎧 Browse Sounds
            </Button>
            <Button variant="outline" className="text-sm">
              🖼 Explore Reels
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatIs3MGodini;