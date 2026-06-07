import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CopyButton } from './CopyButton.js';
import { cn } from '../../lib/utils.js';

interface JsonViewerProps {
  data: any;
  title?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title = 'Payload JSON',
  className,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div className={cn("border border-dark-border rounded-card bg-dark-bg/40 overflow-hidden text-left", className)}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-2.5 bg-dark-surface border-b border-dark-border cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={formatted} toastMessage="JSON copied to clipboard" className="h-7 w-7 p-1" />
        </div>
      </div>

      {/* Code body */}
      {expanded && (
        <pre className="p-4 overflow-x-auto text-xs font-mono text-indigo-300 bg-[#0d0d12] max-h-80 leading-relaxed select-text">
          <code>{formatted}</code>
        </pre>
      )}
    </div>
  );
};
export default JsonViewer;
