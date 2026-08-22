import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { useTranslation } from './i18n';
import { WifiOff } from 'lucide-react';
import SpaceBackground from './components/SpaceBackground';
import CustomCursor from './components/CustomCursor';

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
    <div className="bg-amber-600/90 backdrop-blur-md text-white p-3 text-center flex items-center justify-center gap-2 sticky top-0 z-50 text-base font-semibold shadow-lg">
      <WifiOff size={20} />
      <span>Offline Mode Active — Telemetry & gameplay saved locally</span>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex-grow flex flex-col items-center justify-center p-8 gap-4 min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
    <span className="text-base text-indigo-200 font-medium">Connecting cognitive wellness...</span>
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Calm cognitive wellness background canvas */}
      <SpaceBackground />

      {/* Interactive custom pointer on desktop */}
      <CustomCursor />

      {/* Offline Status */}
      <OfflineBanner />

      {/* Main Page Routing */}
      <main className="flex-grow flex flex-col relative z-10">
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
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
