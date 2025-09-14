import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CommuteAlertCreator from './CommuteAlertCreator';
import CommuteAlertCard from './CommuteAlertCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Filter, MapPin, Clock } from 'lucide-react';

interface CommuteAlert {
  id: string;
  title: string;
  description?: string;
  alert_type: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  status: string;
  valid_until?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface CommuteAlertFeedProps {
  showCreator?: boolean;
}

const CommuteAlertFeed = ({ showCreator = true }: CommuteAlertFeedProps) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CommuteAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('active');
  const [sortBy, setSortBy] = useState('newest');

  const loadAlerts = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('commute_alerts')
        .select(`
          id,
          title,
          description,
          alert_type,
          location_name,
          latitude,
          longitude,
          severity,
          status,
          valid_until,
          likes_count,
          comments_count,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (alertTypeFilter !== 'all') {
        query = query.eq('alert_type', alertTypeFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const now = new Date().toISOString();
      if (timeFilter === 'active') {
        query = query.eq('status', 'active').or(`valid_until.gte.${now},valid_until.is.null`);
      } else if (timeFilter === 'resolved') {
        query = query.eq('status', 'resolved');
      } else if (timeFilter === 'expired') {
        query = query.eq('status', 'active').lt('valid_until', now);
      }

      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'severity':
          query = query.order('severity', { ascending: false }); // Needs custom sorting for enum
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [alertTypeFilter, severityFilter, timeFilter, sortBy, searchTerm]);

  const handleAlertCreated = () => {
    loadAlerts(true);
  };

  const handleAlertUpdate = () => {
    loadAlerts(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Alert Creator */}
      {showCreator && (
        <div className="mb-6">
          <CommuteAlertCreator onAlertCreated={handleAlertCreated} />
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by title, description, or location..."
            className="pl-10 bg-gray-800 border-red-500/50 text-white placeholder:text-gray-400 focus:border-red-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-red-500/50 text-white">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="traffic_jam">Traffic Jam</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="road_closure">Road Closure</SelectItem>
              <SelectItem value="public_transport_delay">Public Transport Delay</SelectItem>
              <SelectItem value="public_transport_breakdown">Public Transport Breakdown</SelectItem>
              <SelectItem value="protest">Protest</SelectItem>
              <SelectItem value="weather_hazard">Weather Hazard</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-red-500/50 text-white">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-red-500/50 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-red-500/50 text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAlerts(true)}
            disabled={isRefreshing}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <CommuteAlertCard 
              key={alert.id} 
              alert={alert} 
              onAlertUpdate={handleAlertUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm || alertTypeFilter !== 'all' || severityFilter !== 'all' || timeFilter !== 'active'
              ? 'No alerts found matching your filters.'
              : 'No commute alerts posted yet.'
            }
          </p>
          {showCreator && !searchTerm && alertTypeFilter === 'all' && severityFilter === 'all' && timeFilter === 'active' && (
            <p className="text-gray-500">
              Be the first to report a commute alert! 🚨
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommuteAlertFeed;

