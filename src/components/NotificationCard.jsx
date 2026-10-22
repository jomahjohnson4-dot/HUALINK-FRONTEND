import {
  ShoppingBag,
  Truck,
  MessageCircle,
  Box,
  Bell,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { relativeTime, absoluteTime } from '../utils/time';

/**
 * The visual tone of a notification.
 *
 *  - `success` (green) — something completed: an account was verified, an
 *    order was delivered, a catalogue change was published.
 *  - `alert`   (red)    — something needs attention: a failure, a
 *    cancellation, a new enquiry or a security alert.
 *  - `order`   (blue)   — a purchase/order lifecycle update.
 */
const ALERT_KEYWORDS = [
  'failed',
  'failure',
  'cancelled',
  'canceled',
  'expired',
  'rejected',
  'denied',
  'unauthorised',
  'unauthorized',
  'suspended',
  'alert',
  'warning',
  'out of stock',
  'incorrect',
];

/**
 * Resolves the tone of a notification from its type and wording.
 *
 * @param {object} notification
 * @returns {'success'|'alert'|'order'}
 */
const resolveTone = (notification) => {
  const text = `${notification?.title || ''} ${notification?.message || ''}`.toLowerCase();

  // A failure always reads as an alert, whatever the type says.
  if (ALERT_KEYWORDS.some((keyword) => text.includes(keyword))) return 'alert';

  switch (notification?.type) {
    case 'ORDER':
      return 'order';
    case 'INQUIRY':
      return 'alert';
    case 'SIGNUP':
    case 'VERIFY':
      return 'success';
    case 'PRODUCT':
      return 'success';
    default:
      return 'success';
  }
};

/** Icon + colour for each tone. */
const TONE_STYLES = {
  success: {
    Icon: CheckCircle2,
    wrap: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    dot: 'bg-emerald-500',
    labelKey: 'notifications.tones.success',
  },
  alert: {
    Icon: AlertTriangle,
    wrap: 'bg-red-50 text-red-600 border-red-100',
    dot: 'bg-red-500',
    labelKey: 'notifications.tones.alert',
  },
  order: {
    Icon: Truck,
    wrap: 'bg-blue-50 text-blue-600 border-blue-100',
    dot: 'bg-blue-500',
    labelKey: 'notifications.tones.order',
  },
};

/** Icon per notification type — used inside the tone badge. */
const TYPE_ICONS = {
  ORDER: ShoppingBag,
  INQUIRY: MessageCircle,
  PRODUCT: Box,
  SYSTEM: Bell,
  SIGNUP: UserPlus,
  VERIFY: ShieldCheck,
};

/**
 * The call-to-action shown on a notification card.
 *
 * @param {object} notification
 * @param {object} options
 * @param {Function} options.t the i18next translate function
 * @param {boolean} [options.isAdmin]
 * @returns {{label: string, to: string}|null}
 */
const resolveAction = (notification, { t, isAdmin = false } = {}) => {
  switch (notification?.type) {
    case 'ORDER':
      return { label: t('notifications.actions.viewOrder'), to: '/orders' };
    case 'SIGNUP':
    case 'VERIFY':
      return { label: t('notifications.actions.verify'), to: '/notifications?tab=account' };
    case 'INQUIRY':
      return isAdmin
        ? { label: t('notifications.actions.replyChat'), to: '/dashboard/chat' }
        : { label: t('notifications.actions.viewInquiry'), to: '/notifications' };
    case 'PRODUCT':
      return { label: t('notifications.actions.viewCatalogue'), to: '/shop' };
    default:
      return { label: t('notifications.actions.viewNotifications'), to: '/notifications' };
  }
};

/**
 * A single notification card.
 *
 * Shows the status icon (green success / red alert / blue order), the title,
 * the detailed message, the relative timestamp and the action button.
 */
export default function NotificationCard({ notification, onSelect, onAction, isAdmin = false }) {
  const { t } = useTranslation();
  const tone = resolveTone(notification);
  const { Icon, wrap, dot, labelKey } = TONE_STYLES[tone];
  const label = t(labelKey);
  const TypeIcon = TYPE_ICONS[notification.type] || Bell;
  const action = resolveAction(notification, { t, isAdmin });

  return (
    <article
      className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        notification.isRead
          ? 'border-slate-200'
          : 'border-red-200 shadow-sm shadow-red-500/5'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Status icon */}
        <span
          className={`shrink-0 h-11 w-11 rounded-2xl border flex items-center justify-center ${wrap}`}
          aria-label={label}
          title={label}
        >
          <Icon size={19} />
        </span>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 leading-snug">
                  {notification.title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${wrap}`}
                >
                  <TypeIcon size={9} />
                  <span>{notification.type}</span>
                </span>
              </div>

              <p className="text-[12px] font-medium text-slate-500 leading-relaxed mt-1.5">
                {notification.message}
              </p>
            </div>

            {/* Timestamp */}
            <div className="shrink-0 text-right">
              <span
                className="text-[10px] font-bold text-slate-400 whitespace-nowrap"
                title={absoluteTime(notification.createdAt)}
              >
                {relativeTime(notification.createdAt)}
              </span>
              {!notification.isRead ? (
                <span
                  className={`block w-2 h-2 rounded-full ml-auto mt-1.5 ${dot}`}
                  aria-label={t('notifications.unreadAria')}
                />
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3.5">
            {action ? (
              <button
                type="button"
                onClick={() => onAction?.(notification, action)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-red-600 transition-colors cursor-pointer"
              >
                <span>{action.label}</span>
                <ArrowRight size={11} />
              </button>
            ) : null}

            {!notification.isRead ? (
              <button
                type="button"
                onClick={() => onSelect?.(notification)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{t('notifications.markAsRead')}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
