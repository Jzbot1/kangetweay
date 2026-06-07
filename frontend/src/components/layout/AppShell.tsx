import React from 'react';
import { Outlet } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar.js';
import Topbar from './Topbar.js';
import BottomNav from './BottomNav.js';
import ToastContainer from '../ui/Toast.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useAuth } from '../../hooks/useAuth.js';

export const AppShell: React.FC = () => {
  useAuth();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100 overflow-hidden select-none">
      {/* Toast popup portal */}
      <ToastContainer />

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Core shell container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header toolbar */}
        <Topbar />

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 p-4 md:p-6 layout-content-height bg-dark-bg/25">
          {user && !user.is_approved && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-card flex items-start gap-3 text-amber-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div className="text-left text-sm">
                <span className="font-semibold block text-amber-300">Account Pending Verification</span>
                Your developer account has not yet been approved by an administrator. While you can configure credentials and generate API keys here, any outbound requests through the gateway proxy will be blocked until approved.
              </div>
            </div>
          )}
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
export default AppShell;
