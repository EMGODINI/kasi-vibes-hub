import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bus, Train, Clock, MapPin, AlertTriangle, Search, Refresh } from 'lucide-react';

interface TransportRoute {
  id: string;
  route_number: string;
  route_name: string;
  transport_type: string;
  operator: string;
  start_location: string;
  end_location: string;
  average_duration_minutes: number;
  fare_price: number;
}

interface TransportSchedule {
  id: string;
  departure_time: string;
  arrival_time?: string;
  days_of_week: number[];
  frequency_minutes?: number;
  notes?: string;
}

interface TransportAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  start_time?: string;
  end_time?: string;
}

const TransportSchedules: React.FC = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [schedules, setSchedules] = useState<TransportSchedule[]>([]);
  const [alerts, setAlerts] = useState<TransportAlert[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transportType, setTransportType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      let query = supabase
        .from('transport_routes')
        .select('*')
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`route_name.ilike.%${searchTerm}%,start_location.ilike.%${searchTerm}%,end_location.ilike.%${searchTerm}%`);
      }

      if (transportType) {
        query = query.eq('transport_type', transportType);
      }

      const { data, error } = await query.order('route_number');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading routes',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchSchedules = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('transport_schedules')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true)
        .order('departure_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading schedules',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('transport_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading alerts',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRoutes(), fetchAlerts()]);
      setLoading(false);
    };
    loadData();
  }, [searchTerm, transportType]);

  useEffect(() => {
    if (selectedRoute) {
      fetchSchedules(selectedRoute);
    } else {
      setSchedules([]);
    }
  }, [selectedRoute]);

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'train':
      case 'metro':
        return <Train className="w-4 h-4" />;
      default:
        return <Bus className="w-4 h-4" />;
    }
  };

  const getTransportTypeColor = (type: string) => {
    switch (type) {
      case 'train':
        return 'bg-blue-600';
      case 'metro':
        return 'bg-green-600';
      case 'brt':
        return 'bg-orange-600';
      case 'bus':
        return 'bg-purple-600';
      case 'taxi':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDayNames = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => dayNames[day]).join(', ');
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading transport information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bus className="w-5 h-5 mr-2" />
            Public Transport Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search routes, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 border-orange-500/50 text-white placeholder:text-gray-400"
            />
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-orange-500/50 text-white">
                <SelectValue placeholder="Transport type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-orange-500/50 text-white">
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="metro">Metro</SelectItem>
                <SelectItem value="brt">BRT</SelectItem>
                <SelectItem value="taxi">Taxi</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchRoutes} className="bg-orange-600 hover:bg-orange-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="backdrop-blur-md bg-gray-900/70 border border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Service Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold">{alert.title}</h4>
                  <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <Badge variant="outline" className="mr-2">
                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {alert.start_time && (
                    <span>
                      {new Date(alert.start_time).toLocaleString()}
                      {alert.end_time && ` - ${new Date(alert.end_time).toLocaleString()}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Routes List */}
        <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-white">Available Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {routes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No routes found</p>
            ) : (
              routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedRoute === route.id
                      ? 'bg-orange-600/20 border border-orange-500'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getTransportTypeColor(route.transport_type)} text-white`}>
                        {getTransportIcon(route.transport_type)}
                        <span className="ml-1">{route.route_number}</span>
                      </Badge>
                      <span className="text-white font-medium">{route.route_name}</span>
                    </div>
                    <span className="text-orange-400 font-semibold">R{route.fare_price}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    {route.start_location} → {route.end_location}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{route.operator}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      ~{route.average_duration_minutes} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Schedules */}
        <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {selectedRoute ? 'Schedule' : 'Select a Route'}
              </CardTitle>
              {selectedRoute && (
                <Button
                  onClick={() => fetchSchedules(selectedRoute)}
                  size="sm"
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                >
                  <Refresh className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {!selectedRoute ? (
              <p className="text-gray-400 text-center py-8">
                Select a route from the list to view its schedule
              </p>
            ) : schedules.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No schedule information available</p>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-medium">
                        {formatTime(schedule.departure_time)}
                        {schedule.arrival_time && ` - ${formatTime(schedule.arrival_time)}`}
                      </span>
                    </div>
                    {schedule.frequency_minutes && (
                      <Badge variant="outline" className="text-xs">
                        Every {schedule.frequency_minutes} min
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-1">
                    {getDayNames(schedule.days_of_week)}
                  </div>
                  {schedule.notes && (
                    <p className="text-xs text-gray-400 italic">{schedule.notes}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransportSchedules;

