import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ShoppingBag,
  MessageCircle,
  Box,
  CheckCheck,
  Loader2,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '../api/notificationService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { relativeTime } from '../utils/time';

/** Icon + tint for each notification type. */
const TYPE_STYLES = {
  ORDER: { Icon: ShoppingBag, tint: 'bg-orange-500/15 text-orange-400' },
  INQUIRY: { Icon: MessageCircle, tint: 'bg-sky-500/15 text-sky-400' },
  PRODUCT: { Icon: Box, tint: 'bg-emerald-500/15 text-emerald-400' },
  SYSTEM: { Icon: Bell, tint: 'bg-slate-500/15 text-slate-300' },
  SIGNUP: { Icon: CheckCheck, tint: 'bg-emerald-500/15 text-emerald-400' },
  VERIFY: { Icon: CheckCheck, tint: 'bg-violet-500/15 text-violet-400' },
};

export default function NotificationBell({ limit = 20 }) {
  const { isAuthenticated } = useAuth();
  const { push } = useToast();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  /**
   * Loads the feed. The unread counter is always taken from the server so it
   * matches the database even if a live event was missed.
   */
  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const { notifications: list, unreadCount: count } = await getNotifications({ limit });
      setNotifications(list);
      setUnreadCount(count);
    } catch (error) {
      console.error('[Notifications] Failed to load the feed:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limit]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    load();

    // Poll as a safety net so the badge stays accurate even if the live
    // stream is blocked by a proxy.
    const poll = setInterval(load, 45000);

    return () => clearInterval(poll);
  }, [isAuthenticated, load]);

  /**
   * Live updates: the server pushes every new system event over SSE.
   */
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    return subscribeToNotifications(
      (notification) => {
        setNotifications((current) => {
          if (current.some((item) => item.id === notification.id)) return current;
          return [notification, ...current].slice(0, limit);
        });
        setUnreadCount((current) => current + 1);

        // Instant toast alert for the live activity.
        push({
          title: notification.title,
          message: notification.message,
          tone: 'notification',
          notificationType: notification.type,
          duration: 5000,
        });
      },
      () => {
        // The stream dropped — the polling fallback keeps the badge current.
      }
    );
  }, [isAuthenticated, limit, push]);

  // Close the panel when clicking outside of it.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /** Marks a single notification as read. */
  const handleSelect = async (notification) => {
    if (notification.isRead) return;

    // Optimistic — the server response confirms it a moment later.
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      await markNotificationRead(notification.id);
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error);
      load();
    }
  };

  /** Marks every notification in the feed as read. */
  const handleMarkAll = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      push(t('notifications.markAllReadToast'));
    } catch (error) {
      console.error('[Notifications] Failed to mark all as read:', error);
      push(
        error?.response?.data?.message || t('notifications.markAllReadError'),
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={
          unreadCount
            ? `${t('notifications.bellAria')} (${t('notifications.unread', { count: unreadCount })})`
            : t('notifications.bellAria')
        }
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-900 hover:text-brand-red hover:bg-red-50 transition-all cursor-pointer"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="menu"
          aria-label={t('notifications.title')}
          className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-xs font-black text-gray-900">{t('notifications.title')}</p>
              <p className="text-[10px] font-semibold text-gray-500">
                {t('notifications.unread', { count: unreadCount })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={busy || unreadCount === 0}
              className="flex items-center gap-1.5 text-[10px] font-black text-brand-red hover:text-red-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <CheckCheck size={12} />
              )}
              <span>{t('notifications.markAllRead')}</span>
            </button>
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {loading && !notifications.length ? (
              <div className="py-10 flex items-center justify-center gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin text-brand-red" />
                <span className="text-[11px] font-bold">{t('notifications.loading')}</span>
              </div>
            ) : null}

            {!loading && !notifications.length ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                <Inbox size={22} />
                <p className="text-[11px] font-bold">{t('notifications.caughtUp')}</p>
              </div>
            ) : null}

            {notifications.map((notification) => {
              const { Icon, tint } = TYPE_STYLES[notification.type] || TYPE_STYLES.SYSTEM;

              return (
                <button
                  key={notification.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(notification)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    notification.isRead ? '' : 'bg-red-50/40'
                  }`}
                >
                  <span
                    className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${tint}`}
                  >
                    <Icon size={14} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-black text-gray-900 leading-snug">
                        {notification.title}
                      </span>
                      <span className="shrink-0 text-[9px] font-bold text-gray-400 whitespace-nowrap">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </span>
                    <span className="block text-[10px] font-medium text-gray-500 leading-snug mt-0.5">
                      {notification.message}
                    </span>
                    {!notification.isRead ? (
                      <span className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-red" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              {t('notifications.systemActivityLive')}
            </p>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-[10px] font-black text-brand-red hover:text-red-700 transition-colors"
            >
              <span>{t('notifications.viewAll')}</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
