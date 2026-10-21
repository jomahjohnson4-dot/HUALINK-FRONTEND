import { createContext, useContext } from 'react';
import { useToasts } from '../components/admin/useToasts';
import { ToastStack } from '../components/admin/ToastStack';

/**
 * Application-wide toast queue.
 *
 * The provider owns a single `ToastStack`, so any component (the admin
 * panels, the notification bell, the checkout flow) can raise an instant
 * alert without owning its own stack.
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, push, dismiss } = useToasts();

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Access the global toast queue.
 *
 * @returns {{toasts: object[], push: (message: string, tone?: string) => string, dismiss: (id: string) => void}}
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    // Rendering outside the provider must never crash the page.
    return { toasts: [], push: () => '', dismiss: () => {} };
  }

  return context;
}

export default ToastContext;
