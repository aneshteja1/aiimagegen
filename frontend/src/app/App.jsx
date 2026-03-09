import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useAuthStore from '../store/authStore.js';
import useCompanyStore from '../store/companyStore.js';
import AppShell from './components/Layout/AppShell.jsx';
import { ProtectedRoute, ApprovedRoute, AdminRoute, SuperAdminRoute, PublicOnlyRoute } from './routes/RouteGuards.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';

// Public
const LandingPage        = lazy(() => import('./pages/LandingPage/LandingPage.jsx'));
const LoginPage          = lazy(() => import('./pages/AuthPage/LoginPage.jsx'));
const RegisterPage       = lazy(() => import('./pages/AuthPage/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/AuthPage/ForgotPasswordPage.jsx'));
const ResetPasswordPage  = lazy(() => import('./pages/AuthPage/ResetPasswordPage.jsx'));

// Auth status
const PendingPage  = lazy(() => import('./pages/PendingPage/PendingPage.jsx'));
const RejectedPage = lazy(() => import('./pages/PendingPage/RejectedPage.jsx'));

// User pages
const DashboardPage       = lazy(() => import('./pages/DashboardPage/DashboardPage.jsx'));
const SwapModelPage       = lazy(() => import('./pages/SwapModelPage/SwapModelPage.jsx'));
const ImageGenerationPage = lazy(() => import('./pages/ImageGenerationPage/ImageGenerationPage.jsx'));
const VideoGenerationPage = lazy(() => import('./pages/VideoGenerationPage/VideoGenerationPage.jsx'));
const BulkGenerationPage  = lazy(() => import('./pages/BulkGenerationPage/BulkGenerationPage.jsx'));
const AvatarLibraryPage   = lazy(() => import('./pages/AvatarLibraryPage/AvatarLibraryPage.jsx'));
const JobHistoryPage      = lazy(() => import('./pages/JobHistoryPage/JobHistoryPage.jsx'));
const DownloadCenterPage  = lazy(() => import('./pages/DownloadCenterPage/DownloadCenterPage.jsx'));
const SettingsPage        = lazy(() => import('./pages/SettingsPage/SettingsPage.jsx'));
const BillingPage         = lazy(() => import('./pages/BillingPage/BillingPage.jsx'));
const UsageAnalyticsPage  = lazy(() => import('./pages/UsageAnalyticsPage/UsageAnalyticsPage.jsx'));

// Company Dashboards (3 companies)
const LumiereDashboard    = lazy(() => import('./pages/company/LumiereFashion/LumiereDashboard.jsx'));
const StudioNovaDashboard = lazy(() => import('./pages/company/StudioNova/StudioNovaDashboard.jsx'));
const ApexAtelierDashboard= lazy(() => import('./pages/company/ApexAtelier/ApexAtelierDashboard.jsx'));

// Admin
const AdminDashboardPage   = lazy(() => import('./pages/admin/AdminDashboardPage/AdminDashboardPage.jsx'));
const UserManagementPage   = lazy(() => import('./pages/admin/UserManagementPage/UserManagementPage.jsx'));
const AvatarManagementPage = lazy(() => import('./pages/admin/AvatarManagementPage/AvatarManagementPage.jsx'));
const CreditManagementPage = lazy(() => import('./pages/admin/CreditManagementPage/CreditManagementPage.jsx'));
const JobMonitoringPage    = lazy(() => import('./pages/admin/JobMonitoringPage/JobMonitoringPage.jsx'));

// Super Admin
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/SuperAdminDashboardPage/SuperAdminDashboardPage.jsx'));
const CompanyManagementPage   = lazy(() => import('./pages/superadmin/CompanyManagementPage/CompanyManagementPage.jsx'));
const GlobalSettingsPage      = lazy(() => import('./pages/superadmin/GlobalSettingsPage/GlobalSettingsPage.jsx'));

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-background)' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-text-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const { initialize, user } = useAuthStore();
  const { setActiveCompany } = useCompanyStore();

  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (user?.company_id) setActiveCompany(user.company_id); }, [user, setActiveCompany]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login"          element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register"       element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/forgot-password"element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Auth status */}
            <Route path="/pending"  element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />
            <Route path="/rejected" element={<ProtectedRoute><RejectedPage /></ProtectedRoute>} />

            {/* App Shell — all approved routes */}
            <Route path="/" element={<ApprovedRoute><AppShell /></ApprovedRoute>}>
              <Route path="dashboard"          element={<DashboardPage />} />
              <Route path="swap-model"         element={<SwapModelPage />} />
              <Route path="image-generation"   element={<ImageGenerationPage />} />
              <Route path="video-generation"   element={<VideoGenerationPage />} />
              <Route path="bulk-generation"    element={<BulkGenerationPage />} />
              <Route path="avatar-library"     element={<AvatarLibraryPage />} />
              <Route path="jobs"               element={<JobHistoryPage />} />
              <Route path="downloads"          element={<DownloadCenterPage />} />
              <Route path="settings"           element={<SettingsPage />} />
              <Route path="billing"            element={<BillingPage />} />
              <Route path="analytics"          element={<UsageAnalyticsPage />} />

              {/* Company-specific dashboards */}
              <Route path="company/lumiere"    element={<LumiereDashboard />} />
              <Route path="company/studio-nova"element={<StudioNovaDashboard />} />
              <Route path="company/apex"       element={<ApexAtelierDashboard />} />

              {/* Admin */}
              <Route path="admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="admin/users"     element={<AdminRoute><UserManagementPage /></AdminRoute>} />
              <Route path="admin/avatars"   element={<AdminRoute><AvatarManagementPage /></AdminRoute>} />
              <Route path="admin/credits"   element={<AdminRoute><CreditManagementPage /></AdminRoute>} />
              <Route path="admin/jobs"      element={<AdminRoute><JobMonitoringPage /></AdminRoute>} />

              {/* Super Admin */}
              <Route path="superadmin/dashboard"  element={<SuperAdminRoute><SuperAdminDashboardPage /></SuperAdminRoute>} />
              <Route path="superadmin/companies"  element={<SuperAdminRoute><CompanyManagementPage /></SuperAdminRoute>} />
              <Route path="superadmin/settings"   element={<SuperAdminRoute><GlobalSettingsPage /></SuperAdminRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
