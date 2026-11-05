import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { WelcomePage } from './pages/WelcomePage';
import { AboutPage } from './pages/AboutPage';
import { CreditsPage } from './pages/CreditsPage';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Dashboard & Planning Pages
import { DailyDigestPage } from './pages/DailyDigestPage';
import { Next7DaysPage } from './pages/Next7DaysPage';
import { PomodoroTimerPage } from './pages/PomodoroTimerPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { CompletedPage } from './pages/CompletedPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/credits" element={<CreditsPage />} />
            </Route>

            {/* Auth Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Authenticated Workspace Pages */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DailyDigestPage />} />
              <Route path="/next-7-days" element={<Next7DaysPage />} />
              <Route path="/timer" element={<PomodoroTimerPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:groupId" element={<GroupDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/completed" element={<CompletedPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
    </AccessibilityProvider>
  );
};

export default App;
