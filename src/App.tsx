import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const PersonalRecordsPage = lazy(() => import("./pages/PersonalRecordsPage"));
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
const StravaCallbackPage  = lazy(() => import("./pages/StravaCallbackPage"));
const GarminCallbackPage  = lazy(() => import("./pages/GarminCallbackPage"));
const EmailConfirmPage    = lazy(() => import("./pages/EmailConfirmPage"));
const NotFound            = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/strava/callback" element={<StravaCallbackPage />} />
              <Route path="/auth/garmin/callback" element={<GarminCallbackPage />} />
              <Route path="/auth/confirm" element={<EmailConfirmPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/workouts" element={<WorkoutsPage />} />
                  <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/records" element={<PersonalRecordsPage />} />
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
