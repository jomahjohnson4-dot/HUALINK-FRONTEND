import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  ShieldCheck,
  UserPlus,
  ShoppingBag,
  MessageCircle,
  Box,
  Radio,
  Loader2,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { getAdminAuditLog, subscribeToNotifications } from '../../api/notificationService';
import { relativeTime, absoluteTime } from '../../utils/time';
import { useTranslation } from 'react-i18next';

/**
 * Admin "Notifications & Audit Log" panel.
 *
 * Unlike the customer feed this view spans every recipient bucket, so the
 * Hualink Admin sees each customer sign-up, order purchase and verification
 * event in a single chronological stream. The verification-code trail is
 * merged in so issued / confirmed / failed OTP and PIN attempts are visible
 * even before they are summarised into a notification.
 *
 * Everything updates live over SSE, so the panel fills up while the admin
 * watches it.
 */

/** Icon + tint for each notification type. */
const TYPE_STYLES = {
  SIGNUP: { Icon: UserPlus, tint: 'bg-emerald-500/15 text-emerald-400' },
  ORDER: { Icon: ShoppingBag, tint: 'bg-sky-500/15 text-sky-400' },
  VERIFY: { Icon: ShieldCheck, tint: 'bg-violet-500/15 text-violet-400' },
  INQUIRY: { Icon: MessageCircle, tint: 'bg-amber-500/15 text-amber-400' },
  PRODUCT: { Icon: Box, tint: 'bg-teal-500/15 text-teal-400' },
  SYSTEM: { Icon: BellRing, tint: 'bg-slate-500/15 text-slate-300' },
};

/** The filter chips shown above the stream. */
const FILTERS = [
  { id: 'ALL', labelKey: 'admin.audit.filters.all' },
  { id: 'SIGNUP', labelKey: 'admin.audit.filters.signups' },
  { id: 'ORDERS', labelKey: 'admin.audit.filters.orders' },
  { id: 'VERIFICATION', labelKey: 'admin.audit.filters.verification' },
  { id: 'INQUIRIES', labelKey: 'admin.audit.filters.inquiries' },
  { id: 'CATALOGUE', labelKey: 'admin.audit.filters.catalogue' },
];

/** Colour for each verification status. */
const VERIFICATION_STATUS = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  VERIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  EXPIRED: 'bg-slate-500/15 text-slate-400 border-slate-600/40',
  FAILED: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function AdminNotificationAuditLog({ limit = 60 }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byType: {}, verifications: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);

  /** Loads the cross-recipient audit trail. */
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getAdminAuditLog({ limit });
      setEvents(data.notifications || []);
      setVerificationCodes(data.verificationCodes || []);
      setSummary(data.summary || { total: 0, byType: {}, verifications: 0 });
    } catch (error) {
      console.error('[Audit Log] Failed to load:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Live updates. The server pushes every new system event to the shared
   * ADMIN bucket, so new sign-ups and orders appear without a refresh.
   */
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (notification) => {
        setLive(true);
        setEvents((current) => {
          if (current.some((item) => item.id === notification.id)) return current;
          return [notification, ...current].slice(0, limit);
        });
        setSummary((current) => ({
          ...current,
          total: (current.total || 0) + 1,
          byType: {
            ...current.byType,
            [notification.type]: (current.byType?.[notification.type] || 0) + 1,
          },
        }));
      },
      () => setLive(false)
    );

    return unsubscribe;
  }, [limit]);

  /** The events matching the active filter chip. */
  const visibleEvents = useMemo(() => {
    if (filter === 'ALL') return events;

    const map = {
      SIGNUP: ['SIGNUP'],
      ORDERS: ['ORDER'],
      VERIFICATION: ['VERIFY'],
      INQUIRIES: ['INQUIRY'],
      CATALOGUE: ['PRODUCT'],
    };

    const types = map[filter] || [];
    return events.filter((event) => types.includes(event.type));
  }, [events, filter]);

  const statCards = useMemo(
    () => [
      {
        label: t('admin.audit.totalEvents'),
        value: summary.total || 0,
        Icon: BellRing,
        tint: 'text-orange-400',
      },
      {
        label: t('admin.audit.signups'),
        value: summary.byType?.SIGNUP || 0,
        Icon: UserPlus,
        tint: 'text-emerald-400',
      },
      {
        label: t('admin.audit.orders'),
        value: summary.byType?.ORDER || 0,
        Icon: ShoppingBag,
        tint: 'text-sky-400',
      },
      {
        label: t('admin.audit.verifications'),
        value: summary.verifications || 0,
        Icon: ShieldCheck,
        tint: 'text-violet-400',
      },
    ],
    [summary, t]
  );

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, Icon, tint }) => (
          <div
            key={label}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="h-9 w-9 rounded-xl bg-slate-900/70 flex items-center justify-center shrink-0">
              <Icon size={16} className={tint} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-black text-white leading-none">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Event stream */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BellRing size={16} className="text-orange-500" />
                {t('admin.audit.title')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Radio
                  size={10}
                  className={`${live ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}
                />
                {live ? t('admin.audit.live') : t('admin.audit.polling')}
                {t('admin.audit.description')}
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 bg-slate-900/70 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              <span>{t('admin.audit.refresh')}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <SlidersHorizontal size={12} className="text-slate-500 mr-1" />
            {FILTERS.map((item) => {
              const isActive = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-slate-950'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>

          {loading && !events.length ? (
            <div className="py-10 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              <span className="text-xs font-bold">{t('admin.audit.loading')}</span>
            </div>
          ) : null}

          {!loading && !visibleEvents.length ? (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
              <BellRing size={24} />
              <p className="text-xs font-bold">{t('admin.audit.empty')}</p>
            </div>
          ) : null}

          {visibleEvents.length ? (
            <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1">
              {visibleEvents.map((event) => {
                const { Icon, tint } = TYPE_STYLES[event.type] || TYPE_STYLES.SYSTEM;

                return (
                  <div
                    key={event.id}
                    className="w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 bg-slate-900/40 border-slate-800"
                  >
                    <span
                      className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${tint}`}
                    >
                      <Icon size={14} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-white leading-snug">
                          {event.title}
                        </span>
                        <span
                          className="shrink-0 text-[10px] font-semibold text-slate-500 whitespace-nowrap"
                          title={absoluteTime(event.createdAt)}
                        >
                          {relativeTime(event.createdAt)}
                        </span>
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {event.message}
                      </span>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {event.type}
                        {event.userId ? ` · ${event.userId}` : ''}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Verification code audit */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <KeyRound size={16} className="text-violet-400" />
              {t('admin.audit.verificationAudit')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('admin.audit.verificationAuditDesc')}
            </p>
          </div>

          {loading && !verificationCodes.length ? (
            <div className="py-10 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin text-violet-400" />
              <span className="text-xs font-bold">{t('admin.audit.loadingCodes')}</span>
            </div>
          ) : null}

          {!loading && !verificationCodes.length ? (
            <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
              <KeyRound size={24} />
              <p className="text-xs font-bold">{t('admin.audit.emptyCodes')}</p>
            </div>
          ) : null}

          {verificationCodes.length ? (
            <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1">
              {verificationCodes.map((record) => {
                const statusClass =
                  VERIFICATION_STATUS[record.status] || VERIFICATION_STATUS.PENDING;

                return (
                  <div
                    key={record.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-white tracking-widest">
                        {String(record.code || '••••')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${statusClass}`}
                      >
                        {record.status === 'VERIFIED' ? (
                          <CheckCircle2 size={9} />
                        ) : record.status === 'PENDING' ? (
                          <Clock size={9} />
                        ) : (
                          <AlertTriangle size={9} />
                        )}
                        {record.status}
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-400 space-y-0.5">
                      <p>
                        <span className="text-slate-500">{t('admin.audit.purpose')}</span>{' '}
                        {record.purpose || 'SIGNUP'}
                        {record.amount
                          ? ` · TSh ${Number(record.amount).toLocaleString()}`
                          : ''}
                      </p>
                      {record.email ? (
                        <p className="truncate">
                          <span className="text-slate-500">{t('admin.audit.recipient')}</span>{' '}
                          {record.email}
                        </p>
                      ) : null}
                      <p>
                        <span className="text-slate-500">{t('admin.audit.issued')}</span>{' '}
                        {relativeTime(record.createdAt)}
                        {record.verifiedAt
                          ? t('admin.audit.confirmedAgo', {
                              time: relativeTime(record.verifiedAt),
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
