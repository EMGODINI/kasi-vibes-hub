
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Car, MessageCircle, Camera, Briefcase, Mic, Zap, Radio, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    { icon: Car, title: "Die Stance", desc: "Car lifestyle & culture" },
    { icon: MessageCircle, title: "Umgosi", desc: "News & gossip feed" },
    { icon: Camera, title: "Stoko", desc: "Photo uploads & stories" },
    { icon: Briefcase, title: "Hustlers Nje", desc: "Business corner" },
    { icon: Mic, title: "Styla Samahala", desc: "Music & freestyle" },
    { icon: Zap, title: "Umdantso Kuphela", desc: "Dance battles" },
    { icon: Headphones, title: "Siya Pheka", desc: "Podcasts & cooking" },
    { icon: Radio, title: "Live Mix", desc: "DJ performances" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/5"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl mb-6 hover:scale-105 transition-transform duration-300">
                <span className="text-4xl font-bold text-white">3MG</span>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
                3MGodini
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Awe! Welcome to the ultimate kasi social hub. Share your stance, drop your beats, and connect with the culture.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300"
                onClick={() => navigate('/dashboard')}
              >
                Explore Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Discover Your Vibe</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className={`group hover:shadow-xl transition-all duration-500 cursor-pointer border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:scale-105 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-orange-500 group-hover:text-orange-600 transition-colors" />
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            © 2024 3MGodini. Proudly South African. Made for the culture, by the culture.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
