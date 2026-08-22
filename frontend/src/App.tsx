import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { WifiOff } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const ProfileSelection = lazy(() => import('./pages/ProfileSelection'));
const Welcome = lazy(() => import('./pages/Welcome'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Session = lazy(() => import('./pages/Session'));
const GamePage = lazy(() => import('./pages/GamePage'));
const SessionComplete = lazy(() => import('./pages/SessionComplete'));
const CaregiverDashboard = lazy(() => import('./caregiver/Dashboard'));
const CaregiverTrends = lazy(() => import('./caregiver/Trends'));
const CaregiverInsights = lazy(() => import('./caregiver/Insights'));
const CaregiverFamiliarPeople = lazy(() => import('./caregiver/FamiliarPeople'));
const CaregiverReminders = lazy(() => import('./caregiver/Reminders'));
const CaregiverHistory = lazy(() => import('./caregiver/History'));
const Methodology = lazy(() => import('./pages/Methodology'));
const Demo = lazy(() => import('./pages/Demo'));

const OfflineBanner = () => {
  const { isOnline } = useAppContext();
  if (isOnline) return null;
  return (
    <div className="bg-amber-600 text-white p-3 text-center flex items-center justify-center gap-2 sticky top-0 z-50 text-sm font-semibold shadow">
      <WifiOff size={18} />
      <span>Offline Mode Active — Telemetry & gameplay saved locally</span>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex-grow flex flex-col items-center justify-center p-8 gap-4 min-h-[50vh]">
    <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading MindMitra...</span>
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Offline Status */}
      <OfflineBanner />

      {/* Main Page Routing */}
      <main className="flex-grow flex flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/demo" element={<Demo />} />

            {/* Authenticated Caregiver Hub */}
            <Route path="/profiles" element={<ProfileSelection />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Profile Workspace Routes */}
            <Route path="/caregiver" element={<CaregiverDashboard />} />
            <Route path="/caregiver/trends" element={<CaregiverTrends />} />
            <Route path="/caregiver/insights" element={<CaregiverInsights />} />
            <Route path="/caregiver/people" element={<CaregiverFamiliarPeople />} />
            <Route path="/caregiver/reminders" element={<CaregiverReminders />} />
            <Route path="/caregiver/history" element={<CaregiverHistory />} />

            {/* Parametric Profile Workspace Routes (Persistent Refresh Support) */}
            <Route path="/profiles/:profileId" element={<CaregiverDashboard />} />
            <Route path="/profiles/:profileId/overview" element={<CaregiverDashboard />} />
            <Route path="/profiles/:profileId/session" element={<Session />} />
            <Route path="/profiles/:profileId/trends" element={<CaregiverTrends />} />
            <Route path="/profiles/:profileId/insights" element={<CaregiverInsights />} />
            <Route path="/profiles/:profileId/people" element={<CaregiverFamiliarPeople />} />
            <Route path="/profiles/:profileId/reminders" element={<CaregiverReminders />} />
            <Route path="/profiles/:profileId/history" element={<CaregiverHistory />} />

            {/* Elderly Gameplay Interaction Routes */}
            <Route path="/session" element={<Session />} />
            <Route path="/games/:gameType" element={<GamePage />} />
            <Route path="/profiles/:profileId/session/:gameType" element={<GamePage />} />
            <Route path="/profiles/:profileId/games/:gameType" element={<GamePage />} />
            <Route path="/session/complete" element={<SessionComplete />} />

            {/* Catch-all fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
