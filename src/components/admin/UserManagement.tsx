import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Ban, Users, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  roles?: string[];
  badges?: { badge_type: string; is_active: boolean }[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          avatar_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles and badges for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [rolesResult, badgesResult] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id),
            supabase
              .from('user_badges')
              .select('badge_type, is_active')
              .eq('user_id', profile.id)
          ]);

          return {
            ...profile,
            roles: rolesResult.data?.map(r => r.role) || [],
            badges: badgesResult.data || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User promoted to admin'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote user',
        variant: 'destructive'
      });
    }
  };

  const grantBadge = async (userId: string, badgeType: 'verified' | 'admin') => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badgeType,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Badge granted successfully'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error granting badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant badge',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user accounts, roles, and badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.roles?.includes('admin')).length}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.badges?.some(b => b.is_active)).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified Users</div>
            </div>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {user.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {user.badges?.filter(b => b.is_active).map((badge) => (
                        <Badge key={badge.badge_type} variant="outline" className="text-xs">
                          {badge.badge_type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!user.roles?.includes('admin') && (
                      <DropdownMenuItem onClick={() => promoteToAdmin(user.id)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Promote to Admin
                      </DropdownMenuItem>
                    )}
                    {!user.badges?.some(b => b.badge_type === 'verified' && b.is_active) && (
                      <DropdownMenuItem onClick={() => grantBadge(user.id, 'verified')}>
                        <Badge className="h-4 w-4 mr-2" />
                        Grant Verified Badge
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;