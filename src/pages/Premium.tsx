import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import PremiumFeatures from '@/components/PremiumFeatures';
import { Crown, Star, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Premium = () => {
  const { user } = useAuth();

  useEffect(() => {
    // SEO Updates
    document.title = "Premium Features - Upgrade Your Experience | 3MGodini";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upgrade to 3MGodini Premium for ad-free browsing, enhanced analytics, priority support, and exclusive features. Choose the plan that fits your needs.');
    }
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + '/premium');
    }
    
    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Premium Features - Upgrade Your Experience",
      "description": "Upgrade to 3MGodini Premium for ad-free browsing, enhanced analytics, priority support, and exclusive features.",
      "url": window.location.origin + '/premium',
      "mainEntity": {
        "@type": "Product",
        "name": "3MGodini Premium Subscription",
        "description": "Premium subscription service for enhanced social media experience",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "ZAR",
          "lowPrice": "49.99",
          "highPrice": "99.99"
        }
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-yellow-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-yellow-600 shadow-lg">
                <Crown className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              3MG Premium 👑
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unlock the full potential of 3MGodini with premium features, enhanced analytics, 
              ad-free browsing, and priority support. Choose the plan that fits your lifestyle.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-gray-900/50 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-600/20">
                    <Shield className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Ad-Free Experience</h3>
                <p className="text-gray-400 text-sm">Browse without interruptions from sponsored content</p>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-md border border-yellow-500/30 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-yellow-600/20">
                    <Star className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Priority Support</h3>
                <p className="text-gray-400 text-sm">Get fast-track assistance when you need help</p>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-md border border-blue-500/30 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-600/20">
                    <Zap className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Enhanced Features</h3>
                <p className="text-gray-400 text-sm">Access advanced search, analytics, and more</p>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-md border border-green-500/30 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-600/20">
                    <Crown className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Exclusive Badges</h3>
                <p className="text-gray-400 text-sm">Stand out with premium profile badges and themes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <PremiumFeatures />

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-900/50 backdrop-blur-md border border-gray-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Frequently Asked Questions 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-sm mb-4">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
              
              <h3 className="text-white font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-sm mb-4">We accept major credit cards, PayPal, and local South African payment methods including EFT and instant EFT.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Is there a free trial?</h3>
              <p className="text-sm mb-4">New users get a 7-day free trial of Premium features. No credit card required to start your trial.</p>
              
              <h3 className="text-white font-semibold mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-sm mb-4">Yes, you can change your plan at any time. Changes take effect immediately, and billing is prorated accordingly.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Have questions about premium features? 
            <a href="mailto:support@3mgodini.com" className="text-purple-400 hover:text-purple-300 ml-1">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;

