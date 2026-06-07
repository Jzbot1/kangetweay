import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore.js';
import ROUTES from './constants/routes.js';

// Layout
import AppShell from './components/layout/AppShell.js';

// Pages
import Landing from './pages/Landing.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Docs from './pages/Docs.js';
import NotFound from './pages/NotFound.js';

// Dashboard Subviews
import Overview from './pages/dashboard/Overview.js';
import ApiKeys from './pages/dashboard/ApiKeys.js';
import Credentials from './pages/dashboard/Credentials.js';
import Orders from './pages/dashboard/Orders.js';
import Webhooks from './pages/dashboard/Webhooks.js';
import Usage from './pages/dashboard/Usage.js';
import Settings from './pages/dashboard/Settings.js';
import Admin from './pages/dashboard/Admin.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Protect dashboard routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

// Protect admin routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? <>{children}</> : <Navigate to={ROUTES.DASHBOARD.OVERVIEW} replace />;
};

// Redirect logged-in users away from auth cards
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD.OVERVIEW} replace /> : <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing */}
          <Route path={ROUTES.LANDING} element={<Landing />} />
          <Route path={ROUTES.DOCS} element={<Docs />} />

          {/* Auth Cards */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />

          {/* Protected Dashboard Console */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="orders" element={<Orders />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="usage" element={<Usage />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
          </Route>


          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
