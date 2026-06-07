import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore.js';
import { cn } from '../../lib/utils.js';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            layout
            className={cn(
              "glass px-4 py-3.5 rounded-card flex items-start gap-3 shadow-2xl pointer-events-auto border",
              {
                "border-emerald-500/25 bg-emerald-950/20 text-emerald-300": toast.type === 'success',
                "border-rose-500/25 bg-rose-950/20 text-rose-300": toast.type === 'error',
                "border-indigo-500/25 bg-indigo-950/20 text-indigo-300": toast.type === 'info',
              }
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>

            {/* Close */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 p-0.5 rounded transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default ToastContainer;
