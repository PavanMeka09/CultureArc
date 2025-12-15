import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ArtifactUploadPage from './pages/ArtifactUploadPage';
import ProfilePage from './pages/ProfilePage';
import ArtifactDetailPage from './pages/ArtifactDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyEmailPendingPage from './pages/VerifyEmailPendingPage';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collection/:id" element={<CollectionDetailPage />} />
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/upload" element={<ArtifactUploadPage />} />
              <Route path="/edit-artifact/:id" element={<ArtifactUploadPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Public Routes */}
            <Route path="/artifact/:id" element={<ArtifactDetailPage />} />
            {/* Kept specifically for demo purposes if needed, can likely be removed */}
            <Route path="/artifact-detail" element={<ArtifactDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            {/* Email Verification Routes */}
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;