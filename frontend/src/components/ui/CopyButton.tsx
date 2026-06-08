import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore.js';
import { cn } from '../../lib/utils.js';

interface CopyButtonProps {
  value: string;
  className?: string;
  toastMessage?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ value, className, toastMessage }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useUiStore();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }
      setCopied(true);
      if (toastMessage) {
        addToast(toastMessage, 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded bg-dark-bg border border-dark-border text-gray-400 hover:text-gray-200 transition-colors relative active:scale-95",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400 animate-scale" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};
export default CopyButton;
