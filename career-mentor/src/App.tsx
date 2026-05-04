import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/lib/AppContext";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import RoadmapPreviewPage from "./pages/RoadmapPreviewPage";
import RoadmapPage from "./pages/RoadmapPage";
import MilestonePage from "./pages/MilestonePage";
import ExamPage from "./pages/ExamPage";
import ProgressPage from "./pages/ProgressPage";
import AchievementsPage from "./pages/AchievementsPage";
import SettingsPage from "./pages/SettingsPage";
import CertificatePage from "./pages/CertificatePage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, session }: { children: React.ReactNode; session: Session | null }) {
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-heading">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={session ? <Navigate to="/roadmap" replace /> : <AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/onboarding" element={<ProtectedRoute session={session}><OnboardingPage /></ProtectedRoute>} />
              <Route path="/roadmap-preview" element={<ProtectedRoute session={session}><RoadmapPreviewPage /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute session={session}><RoadmapPage /></ProtectedRoute>} />
              <Route path="/milestone/:id" element={<ProtectedRoute session={session}><MilestonePage /></ProtectedRoute>} />
              <Route path="/exam/:milestoneId" element={<ProtectedRoute session={session}><ExamPage /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute session={session}><ProgressPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute session={session}><AchievementsPage /></ProtectedRoute>} />
              <Route path="/certificate" element={<ProtectedRoute session={session}><CertificatePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute session={session}><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute session={session}><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
