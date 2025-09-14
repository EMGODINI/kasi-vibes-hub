import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import PageManager from '@/components/admin/PageManager';
import TrackManager from '@/components/admin/TrackManager';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import ContentModeration from '@/components/admin/ContentModeration';
import UserManagement from '@/components/admin/UserManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import { PlaylistManager } from '@/components/admin/PlaylistManager';
import AdminDailyContentManager from '@/components/admin/AdminDailyContentManager';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminContent = () => {
  const [userStats] = useState({
    totalUsers: 1247,
    activeToday: 89,
    newRegistrations: 23,
    premiumUsers: 156
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage 3MGodini platform and content</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <AdminDailyContentManager />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <PageManager />
          </TabsContent>

          <TabsContent value="tracks" className="space-y-6">
            <TrackManager />
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <PlaylistManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
};

export default Admin;