import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Activity,
  ShoppingBag,
  ShieldCheck,
  Siren,
  Loader2,
  Inbox,
  CheckCheck,
  RefreshCw,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  ADMIN_RECIPIENT,
} from '../api/notificationService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import NotificationCard from '../components/NotificationCard';

/**
 * The dedicated notification centre (/notifications).
 *
 * Four tabs mirror the way the platform generates activity:
 *
 *  1. All Activity      — every system event, newest first.
 *  2. Purchases & Orders — order lifecycle updates (dispatch, delivery...).
 *  3. Account & Verification — sign-ups, OTP confirmations and security
 *     alerts.
 *  4. Admin Alerts     — the platform-wide alerts filed for the Hualink
 *     Admin (new registrations, new orders, new chat enquiries).
 */

/** The tabs of the page. */
const TABS = [
  { id: 'all', labelKey: 'notifications.tabs.all', Icon: Activity, types: null },
  { id: 'orders', labelKey: 'notifications.tabs.purchases', Icon: ShoppingBag, types: ['ORDER'] },
  {
    id: 'account',
    labelKey: 'notifications.tabs.account',
    Icon: ShieldCheck,
    types: ['SIGNUP', 'VERIFY', 'SYSTEM'],
  },
  {
    id: 'admin',
    labelKey: 'notifications.tabs.admin',
    Icon: Siren,
    types: null,
    adminOnly: true,
  },
];

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const { push } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);

  /** Loads the feed. Admins receive the shared activity bucket as well. */
  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    try {
      const { notifications: list, unreadCount: count, recipient: bucket } =
        await getNotifications({ limit: 200, scope: isAdmin ? 'all' : undefined });

      setNotifications(list);
      setUnreadCount(count);
      setRecipient(bucket);
    } catch (error) {
      console.error('[Notifications] Failed to load the feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return undefined;
    }

    load();
    return undefined;
  }, [isAuthenticated, load]);

  /** Live updates over SSE. */
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    return subscribeToNotifications(
      (notification) => {
        setLive(true);
        setNotifications((current) => {
          if (current.some((item) => item.id === notification.id)) return current;
          return [notification, ...current].slice(0, 200);
        });
        setUnreadCount((current) => current + 1);
      },
      () => setLive(false)
    );
  }, [isAuthenticated]);

  /** Keeps the tab in sync with the ?tab= query parameter. */
  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested && TABS.some((tab) => tab.id === requested)) {
      setActiveTab(requested);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  /** The notifications that belong to the active tab. */
  const visibleNotifications = useMemo(() => {
    const tab = TABS.find((item) => item.id === activeTab) || TABS[0];

    // The Admin Alerts tab shows the shared admin bucket.
    if (tab.id === 'admin') {
      return notifications.filter((item) => item.userId === ADMIN_RECIPIENT);
    }

    if (!tab.types) return notifications;

    return notifications.filter((item) => tab.types.includes(item.type));
  }, [notifications, activeTab]);

  /** Unread counters per tab, shown next to the tab label. */
  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach((tab) => {
      if (tab.id === 'admin') {
        counts[tab.id] = notifications.filter(
          (item) => item.userId === ADMIN_RECIPIENT && !item.isRead
        ).length;
        return;
      }

      const pool = tab.types
        ? notifications.filter((item) => tab.types.includes(item.type))
        : notifications;

      counts[tab.id] = pool.filter((item) => !item.isRead).length;
    });
    return counts;
  }, [notifications]);

  /** Marks a single notification as read. */
  const handleSelect = async (notification) => {
    if (notification.isRead) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
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

  /** Follows the action button of a card. */
  const handleAction = async (notification, action) => {
    await handleSelect(notification);
    if (action?.to) navigate(action.to);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-slate-50">
        <span className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <Lock size={28} />
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-5">
          {t('notifications.signInTitle')}
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm">
          {t('notifications.signInBody')}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
        >
          <span>{t('notifications.signInCta')}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600">
              <Bell size={13} />
              <span>{t('notifications.centreEyebrow')}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
              {t('notifications.yourNotifications')}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {t('notifications.unread', { count: unreadCount })} ·{' '}
              {live ? t('notifications.streamingLive') : t('notifications.polling')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              aria-label={t('notifications.refreshAria')}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{t('notifications.refresh')}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAll}
              disabled={busy || unreadCount === 0}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              <span>{t('notifications.markAllReadShort')}</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1.5">
          {TABS.map(({ id, labelKey, Icon }) => {
            const isActive = activeTab === id;
            const count = tabCounts[id] || 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{t(labelKey)}</span>
                {count > 0 ? (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-white text-red-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Admin-only notice */}
        {activeTab === 'admin' && !isAdmin ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
            <span className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 inline-flex items-center justify-center">
              <Lock size={20} />
            </span>
            <h2 className="text-sm font-black text-slate-900 mt-4">
              {t('notifications.adminRestricted')}
            </h2>
            <p className="text-[11px] font-semibold text-slate-500 mt-1.5 max-w-sm mx-auto">
              {t('notifications.adminRestrictedBody')}
            </p>
          </div>
        ) : null}

        {/* Feed */}
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin text-red-600" />
            <span className="text-xs font-bold">{t('notifications.loadingYours')}</span>
          </div>
        ) : null}

        {!loading && !visibleNotifications.length ? (
          <div className="py-16 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
            <span className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Inbox size={24} />
            </span>
            <p className="text-sm font-black text-slate-900">{t('notifications.nothingHere')}</p>
            <p className="text-[11px] font-semibold text-slate-500 max-w-sm text-center">
              {activeTab === 'admin'
                ? t('notifications.emptyPlatform')
                : t('notifications.emptyAccount')}
            </p>
          </div>
        ) : null}

        {visibleNotifications.length ? (
          <div className="space-y-3">
            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
                onAction={handleAction}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : null}

        {/* Footer note */}
        {recipient ? (
          <p className="text-center text-[10px] font-bold text-slate-400">
            {t('notifications.showingOf', {
              count: visibleNotifications.length,
              total: notifications.length,
              bucket: recipient,
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
