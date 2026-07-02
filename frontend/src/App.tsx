import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AppLayout from './layouts/AppLayout';
import BrowseItemsPage from './pages/items/BrowseItemsPage';
import ItemDetailsPage from './pages/items/ItemDetailsPage';
import ReportItemPage from './pages/items/ReportItemPage';
import UploadImagePage from './pages/items/UploadImagePage';
import DashboardPage from './pages/DashboardPage';
import MyItemsPage from './pages/items/MyItemsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SessionExpiredPage from './pages/system/SessionExpiredPage';
import UnauthorizedPage from './pages/system/UnauthorizedPage';
import NotFoundPage from './pages/system/NotFoundPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ItemModerationPage from './pages/admin/ItemModerationPage';
import MatchCenterPage from './pages/admin/MatchCenterPage';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';

// Configure TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={<LoginPage />} 
              />
              <Route 
                path="/register" 
                element={<RegisterPage />} 
              />
              <Route 
                path="/forgot-password" 
                element={<ForgotPasswordPage />} 
              />
              <Route 
                path="/reset-password" 
                element={<ResetPasswordPage />} 
              />
              <Route 
                path="/session-expired" 
                element={<SessionExpiredPage />} 
              />
              <Route 
                path="/unauthorized" 
                element={<UnauthorizedPage />} 
              />

              {/* Public Routes */}
              <Route 
                path="/" 
                element={<LandingPage />} 
              />
              <Route 
                path="/contact" 
                element={<ContactPage />} 
              />

              {/* Protected Student / Shared Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route 
                    path="/dashboard" 
                    element={<DashboardPage />} 
                  />
                  <Route 
                    path="/items" 
                    element={<BrowseItemsPage />} 
                  />
                  <Route 
                    path="/items/new" 
                    element={<ReportItemPage />} 
                  />
                  <Route 
                    path="/items/:id" 
                    element={<ItemDetailsPage />} 
                  />
                  <Route 
                    path="/items/:id/upload" 
                    element={<UploadImagePage />} 
                  />
                  <Route 
                    path="/my-items" 
                    element={<MyItemsPage />} 
                  />
                  <Route 
                    path="/notifications" 
                    element={<NotificationsPage />} 
                  />
                  <Route 
                    path="/profile" 
                    element={<ProfilePage />} 
                  />
                  <Route 
                    path="/profile/password" 
                    element={<ChangePasswordPage />} 
                  />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route 
                    path="/admin" 
                    element={<AdminDashboardPage />} 
                  />
                  <Route 
                    path="/admin/users" 
                    element={<UserManagementPage />} 
                  />
                  <Route 
                    path="/admin/items" 
                    element={<ItemModerationPage />} 
                  />
                  <Route 
                    path="/admin/match" 
                    element={<MatchCenterPage />} 
                  />
                </Route>
              </Route>

              {/* Catch-all Route */}
              <Route 
                path="*" 
                element={<NotFoundPage />} 
              />
            </Routes>
          </div>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
