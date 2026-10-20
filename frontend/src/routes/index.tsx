import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { CitizenLayout } from '../components/layout/CitizenLayout';
import { AuthorityLayout } from '../components/layout/AuthorityLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { DemoPage } from '../pages/public/DemoPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { TermsPage } from '../pages/public/TermsPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ReportPage } from '../pages/citizen/ReportPage';
import { ReportsListPage } from '../pages/citizen/ReportsListPage';
import { ReportDetailPage } from '../pages/citizen/ReportDetailPage';

// Authority Pages
import { AuthorityDashboard } from '../pages/authority/AuthorityDashboard';
import { IncidentListPage } from '../pages/authority/IncidentListPage';
import { IncidentDetailPage } from '../pages/authority/IncidentDetailPage';
import { MapPage } from '../pages/authority/MapPage';
import { HotspotsPage } from '../pages/authority/HotspotsPage';
import { AnalyticsPage } from '../pages/authority/AnalyticsPage';
import { DepartmentsPage } from '../pages/authority/DepartmentsPage';
import { SettingsPage } from '../pages/authority/SettingsPage';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'CITIZEN') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'AUTHORITY' || user.role === 'ADMIN') return <Navigate to="/authority/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/citizen',
    element: (
      <ProtectedRoute allowedRoles={['CITIZEN']}>
        <CitizenLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <CitizenDashboard /> },
      { path: 'report', element: <ReportPage /> },
      { path: 'reports', element: <ReportsListPage /> },
      { path: 'my-reports', element: <ReportsListPage /> },
      { path: 'reports/:id', element: <ReportDetailPage /> },
      { path: 'my-reports/:id', element: <ReportDetailPage /> }
    ]
  },
  {
    path: '/authority',
    element: (
      <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
        <AuthorityLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AuthorityDashboard /> },
      { path: 'incidents', element: <IncidentListPage /> },
      { path: 'incidents/:id', element: <IncidentDetailPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'hotspots', element: <HotspotsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    path: '/admin',
    element: <Navigate to="/authority/dashboard" replace />
  },
  {
    path: '/admin/dashboard',
    element: <Navigate to="/authority/dashboard" replace />
  }
]);

export default router;
