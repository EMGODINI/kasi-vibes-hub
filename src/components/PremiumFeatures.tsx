import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  BarChart3, 
  Calendar, 
  Users, 
  Upload, 
  MessageSquare,
  Eye,
  Check,
  X
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  max_posts_per_day: number;
  max_file_upload_mb: number;
  max_communities: number;
  is_active: boolean;
}

interface UserSubscription {
  plan_name: string;
  display_name: string;
  features: string[];
  status: string;
  end_date?: string;
}

const PremiumFeatures: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const featureDescriptions: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
    'basic_posting': {
      icon: <MessageSquare className="w-4 h-4" />,
      title: 'Basic Posting',
      description: 'Create posts and share content in communities'
    },
    'community_access': {
      icon: <Users className="w-4 h-4" />,
      title: 'Community Access',
      description: 'Join and participate in all community pages'
    },
    'standard_support': {
      icon: <Shield className="w-4 h-4" />,
      title: 'Standard Support',
      description: 'Basic customer support via email'
    },
    'ad_free': {
      icon: <Eye className="w-4 h-4" />,
      title: 'Ad-Free Experience',
      description: 'Browse without sponsored content and advertisements'
    },
    'priority_support': {
      icon: <Star className="w-4 h-4" />,
      title: 'Priority Support',
      description: 'Fast-track support with dedicated assistance'
    },
    'enhanced_profiles': {
      icon: <Crown className="w-4 h-4" />,
      title: 'Enhanced Profiles',
      description: 'Custom profile themes and premium badges'
    },
    'advanced_search': {
      icon: <Zap className="w-4 h-4" />,
      title: 'Advanced Search',
      description: 'Powerful search filters and saved searches'
    },
    'premium_badges': {
      icon: <Star className="w-4 h-4" />,
      title: 'Premium Badges',
      description: 'Exclusive badges and profile verification'
    },
    'extended_posting': {
      icon: <Upload className="w-4 h-4" />,
      title: 'Extended Posting',
      description: 'Higher daily post limits and larger file uploads'
    },
    'analytics_dashboard': {
      icon: <BarChart3 className="w-4 h-4" />,
      title: 'Analytics Dashboard',
      description: 'Detailed insights on your content performance'
    },
    'content_scheduling': {
      icon: <Calendar className="w-4 h-4" />,
      title: 'Content Scheduling',
      description: 'Schedule posts for optimal engagement times'
    },
    'community_management': {
      icon: <Users className="w-4 h-4" />,
      title: 'Community Management',
      description: 'Advanced tools for managing communities'
    },
    'api_access': {
      icon: <Zap className="w-4 h-4" />,
      title: 'API Access',
      description: 'Developer API access for integrations'
    },
    'custom_branding': {
      icon: <Crown className="w-4 h-4" />,
      title: 'Custom Branding',
      description: 'Personalize your profile and content appearance'
    },
    'unlimited_posting': {
      icon: <Upload className="w-4 h-4" />,
      title: 'Unlimited Posting',
      description: 'No limits on daily posts or file uploads'
    },
    'all_premium_features': {
      icon: <Crown className="w-4 h-4" />,
      title: 'All Premium Features',
      description: 'Access to every premium feature available'
    }
  };

  useEffect(() => {
    if (profile) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [profile]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading plans',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription_plan', { user_uuid: profile.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCurrentSubscription(data[0]);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading subscription',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, planName: string) => {
    if (!profile) return;

    setUpgrading(planId);
    try {
      // In a real implementation, this would integrate with a payment processor
      // For now, we'll simulate the upgrade process
      
      toast({
        title: 'Upgrade Process',
        description: `Redirecting to payment for ${planName} plan...`,
      });

      // Simulate payment processing
      setTimeout(() => {
        toast({
          title: 'Upgrade Successful!',
          description: `You've been upgraded to ${planName}. Enjoy your new features!`,
        });
        setUpgrading(null);
        fetchCurrentSubscription();
      }, 2000);

    } catch (error: any) {
      toast({
        title: 'Upgrade Failed',
        description: error.message,
        variant: 'destructive',
      });
      setUpgrading(null);
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'border-gray-500';
      case 'premium':
        return 'border-purple-500';
      case 'pro':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Users className="w-6 h-6" />;
      case 'premium':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading subscription information...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-400" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{currentSubscription.display_name}</h3>
                <p className="text-gray-400">Status: {currentSubscription.status}</p>
                {currentSubscription.end_date && (
                  <p className="text-gray-400 text-sm">
                    Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge className="bg-purple-600 text-white">
                {currentSubscription.plan_name.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`backdrop-blur-md bg-gray-900/70 border ${getPlanColor(plan.plan_name)} relative ${
              currentSubscription?.plan_name === plan.plan_name ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {currentSubscription?.plan_name === plan.plan_name && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Current Plan</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.plan_name === 'free' ? 'bg-gray-600' :
                  plan.plan_name === 'premium' ? 'bg-purple-600' : 'bg-yellow-600'
                }`}>
                  {getPlanIcon(plan.plan_name)}
                </div>
              </div>
              <CardTitle className="text-white">{plan.display_name}</CardTitle>
              <div className="text-3xl font-bold text-white">
                R{plan.price_monthly}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              {plan.price_yearly && (
                <p className="text-sm text-gray-400">
                  or R{plan.price_yearly}/year (save {Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)}%)
                </p>
              )}
              <p className="text-gray-300 text-sm">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Plan Limits */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Daily Posts:</span>
                  <span>{plan.max_posts_per_day === -1 ? 'Unlimited' : plan.max_posts_per_day}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>File Upload:</span>
                  <span>{plan.max_file_upload_mb}MB max</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Communities:</span>
                  <span>{plan.max_communities === -1 ? 'Unlimited' : plan.max_communities}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Features:</h4>
                <div className="space-y-1">
                  {plan.features.map((feature) => {
                    const featureInfo = featureDescriptions[feature];
                    return featureInfo ? (
                      <div key={feature} className="flex items-center text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <span>{featureInfo.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {currentSubscription?.plan_name === plan.plan_name ? (
                  <Button disabled className="w-full bg-gray-600 text-gray-300">
                    Current Plan
                  </Button>
                ) : plan.plan_name === 'free' ? (
                  <Button disabled className="w-full bg-gray-600 text-gray-300">
                    Default Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id, plan.display_name)}
                    disabled={upgrading === plan.id}
                    className={`w-full ${
                      plan.plan_name === 'premium' 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white`}
                  >
                    {upgrading === plan.id ? 'Processing...' : `Upgrade to ${plan.display_name}`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card className="backdrop-blur-md bg-gray-900/70 border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-white">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-white py-2">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center text-white py-2 px-4">
                      {plan.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureDescriptions).map(([featureKey, featureInfo]) => (
                  <tr key={featureKey} className="border-b border-gray-800">
                    <td className="py-3 text-gray-300">
                      <div className="flex items-center">
                        {featureInfo.icon}
                        <span className="ml-2">{featureInfo.title}</span>
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.features.includes(featureKey) || plan.features.includes('all_premium_features') ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumFeatures;

