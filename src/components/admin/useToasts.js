import { useCallback, useState } from 'react';

/**
 * Minimal toast queue. `useToasts()` returns the current list plus a `push`
 * function; render the list through `<ToastStack />` from ToastStack.jsx.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, push, dismiss };
}
