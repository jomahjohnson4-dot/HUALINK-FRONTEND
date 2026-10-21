import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const TONES = {
  success: {
    icon: CheckCircle2,
    accent: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  error: {
    icon: AlertCircle,
    accent: 'text-red-400',
    border: 'border-red-500/40',
  },
};

function Toast({ toast, onDismiss }) {
  const { icon: Icon, accent, border } = TONES[toast.tone] || TONES.success;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 bg-slate-800 border ${border} rounded-xl px-4 py-3 shadow-2xl animate-fade-in-up max-w-sm`}
    >
      <Icon size={16} className={`${accent} shrink-0 mt-0.5`} />
      <p className="text-xs font-bold text-white leading-snug flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
