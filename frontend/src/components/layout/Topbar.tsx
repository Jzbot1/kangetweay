import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User as UserIcon, Sun, Moon, ChevronDown, Wallet } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useCredentialsBalances } from '../../hooks/useCredentials.js';
import ROUTES from '../../constants/routes.js';
import { cn, formatNumber } from '../../lib/utils.js';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const { data: balances } = useCredentialsBalances();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Convert current path into simple page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === ROUTES.DASHBOARD.OVERVIEW) return 'Dashboard Overview';
    if (path === ROUTES.DASHBOARD.ORDERS) return 'Orders Registry';
    if (path === ROUTES.DASHBOARD.API_KEYS) return 'Gateway API Keys';
    if (path === ROUTES.DASHBOARD.CREDENTIALS) return 'MooGold Credentials';
    if (path === ROUTES.DASHBOARD.WEBHOOKS) return 'Webhooks Config';
    if (path === ROUTES.DASHBOARD.USAGE) return 'Usage Analytics';
    if (path === ROUTES.DASHBOARD.SETTINGS) return 'Account Settings';
    if (path === ROUTES.DOCS) return 'API Reference Manual';
    return 'Gateway Console';
  };

  return (
    <header className="h-16 border-b border-dark-border bg-dark-surface/30 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <h1 className="text-sm font-semibold text-gray-200 tracking-wide uppercase">
        {getPageTitle()}
      </h1>

      {/* Action controls */}
      <div className="flex items-center gap-4">
        {/* Balances summary */}
        {balances && (
          <div className="hidden sm:flex items-center gap-3 bg-[#0f0f16]/60 border border-dark-border/80 px-3 py-1.5 rounded-btn text-xs font-mono select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gray-500 uppercase font-bold">UAT:</span>
              <span className="font-extrabold text-indigo-300">
                {balances.uat.configured ? `₹${formatNumber(balances.uat.balance)}` : '-'}
              </span>
            </div>
            <div className="w-px h-3.5 bg-dark-border/80" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gray-500 uppercase font-bold">Prod:</span>
              <span className="font-extrabold text-emerald-400">
                {balances.production.configured ? `₹${formatNumber(balances.production.balance)}` : '-'}
              </span>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-dark-surface border border-dark-border text-gray-400 hover:text-gray-200 hover:border-brand/30 transition-all active:scale-95"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full border border-dark-border bg-dark-surface hover:border-brand/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold uppercase">
              {user?.name?.substring(0, 2) || <UserIcon className="w-4 h-4" />}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 mr-1 hidden sm:inline-block" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-card bg-dark-surface border border-dark-border shadow-2xl py-1.5 z-50">
              {/* Profile Details */}
              <div className="px-4 py-2 border-b border-dark-border">
                <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Navigation Items */}
              <div className="p-1">
                <Link
                  to={ROUTES.DASHBOARD.SETTINGS}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-dark-bg/60 rounded-btn transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-btn transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Topbar;
