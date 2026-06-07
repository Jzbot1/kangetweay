import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Key,
  ShieldCheck,
  ShoppingBag,
  Webhook,
  BarChart3,
  Settings,
  FileCode2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUiStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import ROUTES from '../../constants/routes.js';
import { cn } from '../../lib/utils.js';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  const links = [
    { name: 'Overview', to: ROUTES.DASHBOARD.OVERVIEW, icon: LayoutDashboard },
    { name: 'Orders', to: ROUTES.DASHBOARD.ORDERS, icon: ShoppingBag },
    { name: 'API Keys', to: ROUTES.DASHBOARD.API_KEYS, icon: Key },
    { name: 'Credentials', to: ROUTES.DASHBOARD.CREDENTIALS, icon: ShieldCheck },
    { name: 'Webhooks', to: ROUTES.DASHBOARD.WEBHOOKS, icon: Webhook },
    { name: 'Usage', to: ROUTES.DASHBOARD.USAGE, icon: BarChart3 },
    { name: 'Settings', to: ROUTES.DASHBOARD.SETTINGS, icon: Settings },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', to: ROUTES.DASHBOARD.ADMIN, icon: ShieldCheck }] : []),
    { name: 'API Docs', to: ROUTES.DOCS, icon: FileCode2 }
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-dark-surface border-r border-dark-border h-screen transition-all duration-300 relative",
        {
          "w-64": sidebarOpen,
          "w-20": !sidebarOpen
        }
      )}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-border overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        </div>
        {sidebarOpen && (
          <span className="font-extrabold text-lg tracking-wider text-gradient">jzgateway</span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.DASHBOARD.OVERVIEW}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-btn text-sm font-medium transition-all group relative",
                  {
                    "bg-brand/10 text-brand border border-brand/20 shadow-md shadow-brand/5": isActive,
                    "text-gray-400 hover:text-gray-200 hover:bg-dark-bg/60 border border-transparent": !isActive
                  }
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen ? (
                <span>{link.name}</span>
              ) : (
                /* Tooltip when collapsed */
                <span className="absolute left-24 bg-dark-bg border border-dark-border text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {link.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute bottom-6 -right-3 w-6 h-6 rounded-full border border-dark-border bg-dark-surface text-gray-400 hover:text-gray-200 hover:border-brand/40 flex items-center justify-center transition-all shadow-md z-50 hover:scale-105"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
};
export default Sidebar;
