import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const LandingPage         = lazy(() => import("./pages/LandingPage"));
const LoginPage           = lazy(() => import("./pages/LoginPage"));
const RegisterPage        = lazy(() => import("./pages/RegisterPage"));
const DashboardPage       = lazy(() => import("./pages/DashboardPage"));
const CalendarPage        = lazy(() => import("./pages/CalendarPage"));
const WorkoutsPage        = lazy(() => import("./pages/WorkoutsPage"));
const WorkoutDetailPage   = lazy(() => import("./pages/WorkoutDetailPage"));
const AnalyticsPage       = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage        = lazy(() => import("./pages/SettingsPage"));
const AdminPage           = lazy(() => import("./pages/AdminPage"));
const RankingPage         = lazy(() => import("./pages/RankingPage"));
const StravaCallbackPage  = lazy(() => import("./pages/StravaCallbackPage"));
const GarminCallbackPage  = lazy(() => import("./pages/GarminCallbackPage"));
const NotFound            = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/strava/callback" element={<StravaCallbackPage />} />
              <Route path="/auth/garmin/callback" element={<GarminCallbackPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/workouts" element={<WorkoutsPage />} />
                  <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/ranking" element={<RankingPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
