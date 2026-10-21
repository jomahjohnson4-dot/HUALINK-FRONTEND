import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ShoppingBag,
  MessageCircle,
  Box,
  CheckCheck,
  Loader2,
  Radio,
} from 'lucide-react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '../../api/notificationService';
import { relativeTime } from '../../utils/time';

const TYPE_STYLES = {
  ORDER: { Icon: ShoppingBag, tint: 'bg-orange-500/15 text-orange-400' },
  INQUIRY: { Icon: MessageCircle, tint: 'bg-sky-500/15 text-sky-400' },
  PRODUCT: { Icon: Box, tint: 'bg-emerald-500/15 text-emerald-400' },
  SYSTEM: { Icon: Bell, tint: 'bg-slate-500/15 text-slate-300' },
};

/**
 * Live activity stream for the admin console.
 *
 * Every system event — chat inquiries, catalogue changes, order status
 * updates — is logged server-side and streamed back over SSE, so this card
 * fills up in real time without a manual refresh.
 */
export default function AdminActivityStream({ limit = 12 }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: list, unreadCount: count } = await getNotifications({ limit });
      setNotifications(list);
      setUnreadCount(count);
    } catch (error) {
      console.error('[Activity Stream] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  /** Push new events straight into the stream. */
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (notification) => {
        setLive(true);
        setNotifications((current) => {
          if (current.some((item) => item.id === notification.id)) return current;
          return [notification, ...current].slice(0, limit);
        });
        setUnreadCount((current) => current + 1);
      },
      () => setLive(false)
    );

    return unsubscribe;
  }, [limit]);

  const handleMarkAll = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[Activity Stream] Failed to mark all as read:', error);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleSelect = async (notification) => {
    if (notification.isRead) return;

    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      await markNotificationRead(notification.id);
    } catch {
      load();
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Activity size={16} className="text-orange-500" />
            System Activity Stream
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Radio
              size={10}
              className={`${live ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}
            />
            {live ? 'Live' : 'Polling'} — every action performed across the platform
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-300 bg-slate-900/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5">
            {unreadCount} unread
          </span>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={busy || unreadCount === 0}
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 bg-slate-900/70 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <CheckCheck size={11} />
            )}
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {loading && !notifications.length ? (
        <div className="py-10 flex items-center justify-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          <span className="text-xs font-bold">Loading the activity log...</span>
        </div>
      ) : null}

      {!loading && !notifications.length ? (
        <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
          <Activity size={24} />
          <p className="text-xs font-bold">No system activity recorded yet.</p>
        </div>
      ) : null}

      {notifications.length ? (
        <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
          {notifications.map((notification) => {
            const { Icon, tint } = TYPE_STYLES[notification.type] || TYPE_STYLES.SYSTEM;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleSelect(notification)}
                className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer ${
                  notification.isRead
                    ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/70 border-orange-500/30 hover:border-orange-500/60'
                }`}
              >
                <span
                  className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${tint}`}
                >
                  <Icon size={14} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-white leading-snug">
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                      {relativeTime(notification.createdAt)}
                    </span>
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {notification.message}
                  </span>
                </span>

                {!notification.isRead ? (
                  <span
                    className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-orange-500"
                    aria-label="Unread"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
