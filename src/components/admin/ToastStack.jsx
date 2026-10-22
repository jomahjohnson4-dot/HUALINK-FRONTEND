import React from 'react';
import { CheckCircle2, ShoppingBag, AlertCircle, Info, X, AlertTriangle, MessageCircle, Box } from "lucide-react";

export function ToastStack({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: CheckCircle2,
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info,
          shopping: ShoppingBag,
          message: MessageCircle,
          box: Box,
        };
        const IconComponent = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 animate-slide-in"
          >
            <IconComponent className="w-5 h-5 shrink-0 text-emerald-500" />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default ToastStack;
