import { useCallback, useState } from 'react';

/**
 * Minimal toast queue. `useToasts()` returns the current list plus a `push`
 * function; render the list through `<ToastStack />` from ToastStack.jsx.
 *
 * `push` accepts either a plain message (optionally followed by a tone) or a
 * full descriptor object:
 *
 *   push('Saved!')                                  → success toast
 *   push('Could not save', 'error')                 → error toast
 *   push({ title, message, tone: 'notification' })  → rich system toast
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((payload, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const toast =
      payload && typeof payload === 'object'
        ? {
            id,
            message: payload.message || '',
            title: payload.title || '',
            tone: payload.tone || 'success',
            notificationType: payload.notificationType || payload.type || null,
            duration: payload.duration,
          }
        : { id, message: String(payload ?? ''), title: '', tone };

    setToasts((current) => [...current, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, push, dismiss };
}
