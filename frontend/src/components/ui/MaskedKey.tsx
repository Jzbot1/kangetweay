import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface MaskedKeyProps {
  value: string;
  className?: string;
  prefixLen?: number;
  suffixLen?: number;
}

export const MaskedKey: React.FC<MaskedKeyProps> = ({ value, className, prefixLen = 8, suffixLen = 4 }) => {
  const [visible, setVisible] = useState(false);

  const getMasked = () => {
    if (value.length <= prefixLen + suffixLen) return value;
    const prefix = value.substring(0, prefixLen);
    const suffix = value.substring(value.length - suffixLen);
    const middle = '•'.repeat(16);
    return `${prefix}${middle}${suffix}`;
  };

  return (
    <div className={cn("inline-flex items-center gap-2 font-mono text-sm", className)}>
      <span className="text-gray-300 tracking-wider">
        {visible ? value : getMasked()}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-dark-surface transition-colors"
        title={visible ? "Hide key" : "Show key"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
export default MaskedKey;
