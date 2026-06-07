import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Key, Settings } from 'lucide-react';
import ROUTES from '../../constants/routes.js';
import { cn } from '../../lib/utils.js';

export const BottomNav: React.FC = () => {
  const links = [
    { name: 'Overview', to: ROUTES.DASHBOARD.OVERVIEW, icon: LayoutDashboard },
    { name: 'Orders', to: ROUTES.DASHBOARD.ORDERS, icon: ShoppingBag },
    { name: 'API Keys', to: ROUTES.DASHBOARD.API_KEYS, icon: Key },
    { name: 'Settings', to: ROUTES.DASHBOARD.SETTINGS, icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-dark-surface/90 backdrop-blur-md border-t border-dark-border flex items-center justify-around px-4 z-40">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === ROUTES.DASHBOARD.OVERVIEW}
            className={({ isActive }) =>
              cn("flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-gray-200 transition-colors w-16 h-full", {
                "text-brand": isActive
              })
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-wider">{link.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
export default BottomNav;
