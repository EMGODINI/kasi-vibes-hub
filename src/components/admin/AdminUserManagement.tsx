import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserStats {
  newRegistrations: number;
  premiumUsers: number;
}

interface AdminUserManagementProps {
  userStats: UserStats;
}

const AdminUserManagement = ({ userStats }: AdminUserManagementProps) => {
  const handleViewQueue = () => {
    console.log('View registration queue');
    // TODO: Implement view queue functionality
  };

  const handleManagePremium = () => {
    console.log('Manage premium users');
    // TODO: Implement premium management functionality
  };

  return (
    <Card className="clean-card">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
            <div>
              <p className="font-medium">User Registration</p>
              <p className="text-sm text-muted-foreground">Manage new user approvals</p>
            </div>
            <Button variant="outline" onClick={handleViewQueue}>
              View Queue ({userStats.newRegistrations})
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
            <div>
              <p className="font-medium">Premium Subscriptions</p>
              <p className="text-sm text-muted-foreground">Manage premium user benefits</p>
            </div>
            <Button variant="outline" onClick={handleManagePremium}>
              Manage ({userStats.premiumUsers})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;