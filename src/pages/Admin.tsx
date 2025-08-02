import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import ContentUpload from '@/components/ContentUpload';
import PageManager from '@/components/admin/PageManager';
import TrackManager from '@/components/admin/TrackManager';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminContentReview from '@/components/admin/AdminContentReview';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import { PlaylistManager } from '@/components/admin/PlaylistManager';
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview userStats={userStats} />
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

          <TabsContent value="content" className="space-y-6">
            <AdminContentReview />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <ContentUpload />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManagement userStats={userStats} />
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