import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Play, 
  Pause, 
  Plus,
  Eye,
  MousePointer,
  Heart,
  MessageCircle
} from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  description: string;
  campaign_type: string;
  target_pages: string[];
  budget_daily?: number;
  budget_total: number;
  spent_amount: number;
  start_date: string;
  end_date?: string;
  status: string;
  target_demographics?: any;
  objectives?: any;
  performance_summary?: any;
}

interface PromotedPost {
  id: string;
  post_id: string;
  promotion_type: string;
  target_pages: string[];
  boost_level: number;
  budget_amount: number;
  spent_amount: number;
  start_date: string;
  end_date?: string;
  status: string;
  posts?: {
    content: string;
    image_url?: string;
  };
}

const PromotedContentManager: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotedPosts, setPromotedPosts] = useState<PromotedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showPromotePost, setShowPromotePost] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    description: '',
    campaign_type: 'post_boost',
    target_pages: [] as string[],
    budget_daily: '',
    budget_total: '',
    end_date: '',
    objectives: 'reach'
  });

  const [postPromotionForm, setPostPromotionForm] = useState({
    post_id: '',
    promotion_type: 'boost',
    target_pages: [] as string[],
    boost_level: 1,
    budget_amount: '',
    end_date: ''
  });

  const availablePages = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'skaters-street', label: 'Skaters Street' },
    { value: 'groovist', label: 'Groovist' },
    { value: 'roll-up', label: 'Roll Up' },
    { value: 'stance', label: 'Stance' },
    { value: 'commute-alerts', label: 'Commute Alerts' }
  ];

  useEffect(() => {
    if (profile) {
      fetchCampaigns();
      fetchPromotedPosts();
    }
  }, [profile]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion_campaigns')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading campaigns',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPromotedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('promoted_posts')
        .select(`
          *,
          posts (
            content,
            image_url
          )
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotedPosts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading promoted posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('promotion_campaigns')
        .insert({
          user_id: profile.id,
          campaign_name: campaignForm.campaign_name,
          description: campaignForm.description,
          campaign_type: campaignForm.campaign_type,
          target_pages: campaignForm.target_pages,
          budget_daily: campaignForm.budget_daily ? parseFloat(campaignForm.budget_daily) : null,
          budget_total: parseFloat(campaignForm.budget_total),
          end_date: campaignForm.end_date || null,
          objectives: { primary: campaignForm.objectives }
        });

      if (error) throw error;

      toast({
        title: 'Campaign Created',
        description: 'Your promotion campaign has been created successfully.',
      });

      setShowCreateCampaign(false);
      setCampaignForm({
        campaign_name: '',
        description: '',
        campaign_type: 'post_boost',
        target_pages: [],
        budget_daily: '',
        budget_total: '',
        end_date: '',
        objectives: 'reach'
      });
      fetchCampaigns();

    } catch (error: any) {
      toast({
        title: 'Campaign Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePromotePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('promoted_posts')
        .insert({
          user_id: profile.id,
          post_id: postPromotionForm.post_id,
          promotion_type: postPromotionForm.promotion_type,
          target_pages: postPromotionForm.target_pages,
          boost_level: postPromotionForm.boost_level,
          budget_amount: parseFloat(postPromotionForm.budget_amount),
          end_date: postPromotionForm.end_date || null
        });

      if (error) throw error;

      toast({
        title: 'Post Promoted',
        description: 'Your post has been promoted successfully.',
      });

      setShowPromotePost(false);
      setPostPromotionForm({
        post_id: '',
        promotion_type: 'boost',
        target_pages: [],
        boost_level: 1,
        budget_amount: '',
        end_date: ''
      });
      fetchPromotedPosts();

    } catch (error: any) {
      toast({
        title: 'Post Promotion Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('promotion_campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Campaign Updated',
        description: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'paused':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading promotion data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Promoted Content Manager</h2>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPromotePost(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Promote Post
          </Button>
          <Button
            onClick={() => setShowCreateCampaign(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Create Campaign Form */}
      {showCreateCampaign && (
        <Card className="backdrop-blur-md bg-gray-900/70 border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Create Promotion Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_name" className="text-gray-300">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    value={campaignForm.campaign_name}
                    onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                    placeholder="My Awesome Campaign"
                    className="bg-gray-800 border-blue-500/50 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_type" className="text-gray-300">Campaign Type</Label>
                  <Select value={campaignForm.campaign_type} onValueChange={(value) => setCampaignForm({...campaignForm, campaign_type: value})}>
                    <SelectTrigger className="bg-gray-800 border-blue-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-blue-500/50 text-white">
                      <SelectItem value="post_boost">Post Boost</SelectItem>
                      <SelectItem value="profile_promotion">Profile Promotion</SelectItem>
                      <SelectItem value="event_promotion">Event Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Target Pages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availablePages.map((page) => (
                    <div key={page.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={page.value}
                        checked={campaignForm.target_pages.includes(page.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCampaignForm({
                              ...campaignForm,
                              target_pages: [...campaignForm.target_pages, page.value]
                            });
                          } else {
                            setCampaignForm({
                              ...campaignForm,
                              target_pages: campaignForm.target_pages.filter(p => p !== page.value)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={page.value} className="text-gray-300 text-sm">
                        {page.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget_daily" className="text-gray-300">Daily Budget (R)</Label>
                  <Input
                    id="budget_daily"
                    type="number"
                    value={campaignForm.budget_daily}
                    onChange={(e) => setCampaignForm({...campaignForm, budget_daily: e.target.value})}
                    placeholder="50.00"
                    className="bg-gray-800 border-blue-500/50 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_total" className="text-gray-300">Total Budget (R)</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    value={campaignForm.budget_total}
                    onChange={(e) => setCampaignForm({...campaignForm, budget_total: e.target.value})}
                    placeholder="500.00"
                    className="bg-gray-800 border-blue-500/50 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-gray-300">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={campaignForm.end_date}
                    onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                    className="bg-gray-800 border-blue-500/50 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  placeholder="Describe your campaign goals and target audience..."
                  className="bg-gray-800 border-blue-500/50 text-white"
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Campaign
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateCampaign(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card className="backdrop-blur-md bg-gray-900/70 border border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No campaigns created yet</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{campaign.campaign_name}</h3>
                      <p className="text-gray-400 text-sm">{campaign.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {campaign.status.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                        className={campaign.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <p className="text-white">{campaign.campaign_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <p className="text-white">R{campaign.budget_total}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Spent:</span>
                      <p className="text-white">R{campaign.spent_amount}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Target Pages:</span>
                      <p className="text-white">{campaign.target_pages.length} pages</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promoted Posts */}
      <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Promoted Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {promotedPosts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No promoted posts yet</p>
          ) : (
            <div className="space-y-4">
              {promotedPosts.map((post) => (
                <div key={post.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-purple-600 text-white">
                          Boost Level {post.boost_level}
                        </Badge>
                        <Badge className={`${getStatusColor(post.status)} text-white`}>
                          {post.status.toUpperCase()}
                        </Badge>
                      </div>
                      {post.posts && (
                        <p className="text-gray-300 text-sm mb-2">
                          {post.posts.content.substring(0, 100)}...
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-400">
                        <div>Budget: R{post.budget_amount}</div>
                        <div>Spent: R{post.spent_amount}</div>
                        <div>Pages: {post.target_pages.length}</div>
                      </div>
                    </div>
                    {post.posts?.image_url && (
                      <img
                        src={post.posts.image_url}
                        alt="Post"
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotedContentManager;

