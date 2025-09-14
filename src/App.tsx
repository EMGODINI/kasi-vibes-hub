
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ParticleBackground } from "@/components/ParticleBackground";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Podcast from "./pages/Podcast";
import PrivateRooms from "./pages/PrivateRooms";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Stance from "./pages/Stance";
import Reels from "./pages/Reels";
import RollUp from "./pages/RollUp";
import SkatersStreet from "./pages/SkatersStreet";
import Groovist from "./pages/Groovist";
import CommuteAlerts from "./pages/CommuteAlerts";
import Premium from "./pages/Premium";
import DynamicPage from "./pages/DynamicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="3mgodini-theme">
      <TooltipProvider>
        <div className="relative min-h-screen">
          <ParticleBackground />
          <div className="relative z-10 min-h-screen bg-gradient-mural/20">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/podcast" element={
                <ProtectedRoute>
                  <Podcast />
                </ProtectedRoute>
              } />
              <Route path="/stance" element={
                <ProtectedRoute>
                  <Stance />
                </ProtectedRoute>
              } />
              <Route path="/reels" element={
                <ProtectedRoute>
                  <Reels />
                </ProtectedRoute>
              } />
              <Route path="/roll-up" element={
                <ProtectedRoute>
                  <RollUp />
                </ProtectedRoute>
              } />
              <Route path="/skaters-street" element={
                <ProtectedRoute>
                  <SkatersStreet />
                </ProtectedRoute>
              } />
              <Route path="/groovist" element={
                <ProtectedRoute>
                  <Groovist />
                </ProtectedRoute>
              } />
              <Route path="/commute-alerts" element={
                <ProtectedRoute>
                  <CommuteAlerts />
                </ProtectedRoute>
              } />
              <Route path="/direct-messages" element={
                <ProtectedRoute>
                  <DirectMessages />
                </ProtectedRoute>
              } />
              <Route path="/premium" element={
                <ProtectedRoute>
                  <Premium />
                </ProtectedRoute>
              } />
              <Route path="/private-rooms" element={
                <ProtectedRoute>
                  <PrivateRooms />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/page/:slug" element={
                <ProtectedRoute>
                  <DynamicPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
