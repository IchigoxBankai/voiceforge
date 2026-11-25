import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage';
import { TTSStudioPage } from './pages/TTSStudioPage';
import { TranslationStudioPage } from './pages/TranslationStudioPage';
import { VoiceLibraryPage } from './pages/VoiceLibraryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AudioHistoryPage } from './pages/AudioHistoryPage';
import { UsageSettingsPage } from './pages/UsageSettingsPage';
import { UserProfilePage } from './pages/UserProfilePage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b3033] flex items-center justify-center font-mono text-xs text-[#DFD6AE]">
        [INITIALIZING VOICEFORGE SESSION...]
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/tts" element={<ProtectedRoute><TTSStudioPage /></ProtectedRoute>} />
              <Route path="/translation" element={<ProtectedRoute><TranslationStudioPage /></ProtectedRoute>} />
              <Route path="/voices" element={<ProtectedRoute><VoiceLibraryPage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><AudioHistoryPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><UsageSettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
};

export default App;

