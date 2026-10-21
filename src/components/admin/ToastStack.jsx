import { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Bell,
  ShoppingBag,
  MessageCircle,
  Box,
  X,
} from 'lucide-react';

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
  info: {
    icon: Info,
    accent: 'text-sky-400',
    border: 'border-sky-500/40',
  },
};

/**
 * Live system-activity toasts. Each notification type gets its own glyph so
 * the alert reads at a glance: orders, chat inquiries, catalogue updates.
 */
export const NOTIFICATION_TONES = {
  ORDER: {
    icon: ShoppingBag,
    accent: 'text-orange-400',
    border: 'border-orange-500/40',
  },
  INQUIRY: {
    icon: MessageCircle,
    accent: 'text-sky-400',
    border: 'border-sky-500/40',
  },
  PRODUCT: {
    icon: Box,
    accent: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  SYSTEM: {
    icon: Bell,
    accent: 'text-slate-300',
    border: 'border-slate-500/40',
  },
};

function Toast({ toast, onDismiss }) {
  const isNotification = toast.tone === 'notification';
  const tone = isNotification
    ? NOTIFICATION_TONES[toast.notificationType] || NOTIFICATION_TONES.SYSTEM
    : TONES[toast.tone] || TONES.success;
  const { icon: Icon, accent, border } = tone;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3200);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 bg-slate-800 border ${border} rounded-xl px-4 py-3 shadow-2xl animate-fade-in-up max-w-sm`}
    >
      <Icon size={16} className={`${accent} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {toast.title ? (
          <p className="text-xs font-black text-white leading-snug">{toast.title}</p>
        ) : null}
        <p className="text-[11px] font-semibold text-slate-300 leading-snug mt-0.5">
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastStack;
