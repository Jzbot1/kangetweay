import React from 'react';
import { cn } from '../../lib/utils.js';

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ options, activeId, onChange, className }) => {
  return (
    <div className={cn("flex border-b border-dark-border gap-1 overflow-x-auto", className)}>
      {options.map((option) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent transition-all whitespace-nowrap text-gray-400 hover:text-gray-200",
              {
                "border-brand text-brand font-semibold": isActive,
              }
            )}
          >
            {option.icon && <span className="w-4 h-4">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
export default Tabs;
