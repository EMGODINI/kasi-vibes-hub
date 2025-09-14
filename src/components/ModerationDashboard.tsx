import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Flag,
  MessageSquare,
  UserX,
  FileText,
  BarChart3
} from 'lucide-react';

interface ModerationReport {
  report_id: string;
  content_type: string;
  content_id: string;
  reporter_username: string;
  reported_username: string;
  reason: string;
  description: string;
  priority: string;
  created_at: string;
}

interface ModerationAction {
  id: string;
  action_type: string;
  target_type: string;
  target_user_id: string;
  reason: string;
  created_at: string;
  moderator_id: string;
  target_username?: string;
  moderator_username?: string;
}

interface UserWarning {
  id: string;
  user_id: string;
  warning_type: string;
  warning_message: string;
  severity: string;
  created_at: string;
  is_acknowledged: boolean;
  username?: string;
}

const ModerationDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [resolutionForm, setResolutionForm] = useState({
    action: '',
    notes: ''
  });
  const [warningForm, setWarningForm] = useState({
    user_id: '',
    warning_type: 'content_violation',
    message: '',
    severity: 'medium'
  });

  useEffect(() => {
    if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
      fetchModerationData();
    }
  }, [profile]);

  const fetchModerationData = async () => {
    try {
      await Promise.all([
        fetchReports(),
        fetchActions(),
        fetchWarnings()
      ]);
    } catch (error: any) {
      toast({
        title: 'Error loading moderation data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .rpc('get_moderation_queue', { moderator_uuid: profile?.id });

    if (error) throw error;
    setReports(data || []);
  };

  const fetchActions = async () => {
    const { data, error } = await supabase
      .from('moderation_actions')
      .select(`
        *,
        target_user:profiles!target_user_id(username),
        moderator:profiles!moderator_id(username)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    const formattedActions = data?.map(action => ({
      ...action,
      target_username: action.target_user?.username,
      moderator_username: action.moderator?.username
    })) || [];
    
    setActions(formattedActions);
  };

  const fetchWarnings = async () => {
    const { data, error } = await supabase
      .from('user_warnings')
      .select(`
        *,
        user:profiles!user_id(username)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    const formattedWarnings = data?.map(warning => ({
      ...warning,
      username: warning.user?.username
    })) || [];
    
    setWarnings(formattedWarnings);
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !profile) return;

    try {
      const { error } = await supabase
        .rpc('resolve_moderation_report', {
          report_uuid: selectedReport.report_id,
          moderator_uuid: profile.id,
          resolution: resolutionForm.action,
          notes: resolutionForm.notes
        });

      if (error) throw error;

      toast({
        title: 'Report Resolved',
        description: 'The moderation report has been resolved successfully.',
      });

      setSelectedReport(null);
      setResolutionForm({ action: '', notes: '' });
      fetchModerationData();

    } catch (error: any) {
      toast({
        title: 'Resolution Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .rpc('create_user_warning', {
          target_user_uuid: warningForm.user_id,
          moderator_uuid: profile.id,
          warning_type_param: warningForm.warning_type,
          message: warningForm.message,
          severity_param: warningForm.severity
        });

      if (error) throw error;

      toast({
        title: 'Warning Created',
        description: 'User warning has been created successfully.',
      });

      setWarningForm({
        user_id: '',
        warning_type: 'content_violation',
        message: '',
        severity: 'medium'
      });
      fetchWarnings();

    } catch (error: any) {
      toast({
        title: 'Warning Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>You don't have permission to access the moderation dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading moderation dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-400" />
            Moderation Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage community content and user behavior</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-600 text-white">
            {profile.role?.toUpperCase()} ACCESS
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-md bg-gray-900/70 border border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Reports</p>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gray-900/70 border border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Warnings</p>
                <p className="text-2xl font-bold text-white">{warnings.filter(w => !w.is_acknowledged).length}</p>
              </div>
              <Flag className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gray-900/70 border border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actions Today</p>
                <p className="text-2xl font-bold text-white">
                  {actions.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Actions</p>
                <p className="text-2xl font-bold text-white">{actions.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="data-[state=active]:bg-gray-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="warnings" className="data-[state=active]:bg-gray-700">
            <Flag className="w-4 h-4 mr-2" />
            Warnings
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-gray-700">
            <Shield className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="backdrop-blur-md bg-gray-900/70 border border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pending reports</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.report_id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`${getPriorityColor(report.priority)} text-white`}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {report.content_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {report.reason.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-white font-medium mb-1">
                            Reported by: {report.reporter_username} → {report.reported_username}
                          </p>
                          <p className="text-gray-300 text-sm mb-2">{report.description}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedReport(report)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Resolution Modal */}
          {selectedReport && (
            <Card className="backdrop-blur-md bg-gray-900/70 border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Resolve Report</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResolveReport} className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Report Details</Label>
                    <div className="bg-gray-800/50 rounded p-3 mt-1">
                      <p className="text-white"><strong>Reporter:</strong> {selectedReport.reporter_username}</p>
                      <p className="text-white"><strong>Reported User:</strong> {selectedReport.reported_username}</p>
                      <p className="text-white"><strong>Reason:</strong> {selectedReport.reason}</p>
                      <p className="text-gray-300"><strong>Description:</strong> {selectedReport.description}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="action" className="text-gray-300">Resolution Action</Label>
                    <Select value={resolutionForm.action} onValueChange={(value) => setResolutionForm({...resolutionForm, action: value})}>
                      <SelectTrigger className="bg-gray-800 border-blue-500/50 text-white">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-blue-500/50 text-white">
                        <SelectItem value="no_action">No Action Required</SelectItem>
                        <SelectItem value="content_removed">Remove Content</SelectItem>
                        <SelectItem value="user_warned">Warn User</SelectItem>
                        <SelectItem value="user_suspended">Suspend User</SelectItem>
                        <SelectItem value="user_banned">Ban User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-gray-300">Moderator Notes</Label>
                    <Textarea
                      id="notes"
                      value={resolutionForm.notes}
                      onChange={(e) => setResolutionForm({...resolutionForm, notes: e.target.value})}
                      placeholder="Add notes about your decision..."
                      className="bg-gray-800 border-blue-500/50 text-white"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedReport(null)}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card className="backdrop-blur-md bg-gray-900/70 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white">Recent Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No moderation actions yet</p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div key={action.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {action.action_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-gray-300 text-sm">
                            Target: {action.target_username} | By: {action.moderator_username}
                          </p>
                          <p className="text-gray-400 text-sm">Reason: {action.reason}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-gray-300 mb-1">
                            {action.target_type.toUpperCase()}
                          </Badge>
                          <p className="text-gray-400 text-xs">
                            {new Date(action.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warnings Tab */}
        <TabsContent value="warnings" className="space-y-4">
          <Card className="backdrop-blur-md bg-gray-900/70 border border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white">User Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              {warnings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No warnings issued</p>
              ) : (
                <div className="space-y-3">
                  {warnings.map((warning) => (
                    <div key={warning.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`${getSeverityColor(warning.severity)} text-white`}>
                              {warning.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {warning.warning_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {warning.is_acknowledged && (
                              <Badge className="bg-green-600 text-white">ACKNOWLEDGED</Badge>
                            )}
                          </div>
                          <p className="text-white font-medium">User: {warning.username}</p>
                          <p className="text-gray-300 text-sm">{warning.warning_message}</p>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {new Date(warning.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card className="backdrop-blur-md bg-gray-900/70 border border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Moderation Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWarning} className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Create User Warning</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_id" className="text-gray-300">User ID</Label>
                    <Input
                      id="user_id"
                      value={warningForm.user_id}
                      onChange={(e) => setWarningForm({...warningForm, user_id: e.target.value})}
                      placeholder="Enter user UUID"
                      className="bg-gray-800 border-purple-500/50 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="warning_type" className="text-gray-300">Warning Type</Label>
                    <Select value={warningForm.warning_type} onValueChange={(value) => setWarningForm({...warningForm, warning_type: value})}>
                      <SelectTrigger className="bg-gray-800 border-purple-500/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-purple-500/50 text-white">
                        <SelectItem value="content_violation">Content Violation</SelectItem>
                        <SelectItem value="behavior_warning">Behavior Warning</SelectItem>
                        <SelectItem value="spam_warning">Spam Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="severity" className="text-gray-300">Severity</Label>
                  <Select value={warningForm.severity} onValueChange={(value) => setWarningForm({...warningForm, severity: value})}>
                    <SelectTrigger className="bg-gray-800 border-purple-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-purple-500/50 text-white">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">Warning Message</Label>
                  <Textarea
                    id="message"
                    value={warningForm.message}
                    onChange={(e) => setWarningForm({...warningForm, message: e.target.value})}
                    placeholder="Enter warning message for the user..."
                    className="bg-gray-800 border-purple-500/50 text-white"
                    required
                  />
                </div>

                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Flag className="w-4 h-4 mr-2" />
                  Create Warning
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationDashboard;

