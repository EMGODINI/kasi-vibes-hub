import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserStats {
  totalUsers: number;
  activeToday: number;
  newRegistrations: number;
  premiumUsers: number;
}

interface AdminOverviewProps {
  userStats: UserStats;
}

const AdminOverview = ({ userStats }: AdminOverviewProps) => {
  const recentActivity = [
    { id: 1, message: 'New user "KasiKing" registered', time: '2m ago', bgColor: 'bg-orange-50' },
    { id: 2, message: 'Post approved in "Die Stance"', time: '5m ago', bgColor: 'bg-blue-50' },
    { id: 3, message: 'Premium subscription activated', time: '12m ago', bgColor: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary to-accent text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-primary-foreground/80 text-xs">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="clean-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeToday}</div>
            <p className="text-muted-foreground text-xs">+5% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="clean-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.newRegistrations}</div>
            <p className="text-muted-foreground text-xs">+8% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="clean-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.premiumUsers}</div>
            <p className="text-muted-foreground text-xs">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="clean-card">
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-3 ${activity.bgColor} rounded-lg`}>
                <span className="text-sm">{activity.message}</span>
                <Badge variant="secondary">{activity.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;