/**
 * Shared time helpers.
 *
 * Kept in its own module so both the header bell, the notifications page and
 * the admin panels can format timestamps without importing each other.
 *
 * Relative labels are resolved through i18next so they follow the active
 * language — the same notification reads "2 mins ago" in English and
 * "dakika 2 zilizopita" in Kiswahili.
 */
import i18n from '../i18n';

/**
 * Turns a timestamp into a short relative label ("2 mins ago").
 *
 * @param {string|number|Date} value an ISO string, epoch or Date
 * @returns {string} the relative label, or an empty string when unparsable
 */
export const relativeTime = (value) => {
  if (!value) return '';

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.round((Date.now() - then) / 1000);
  const t = i18n.t.bind(i18n);

  if (seconds < 45) return t('time.justNow');
  if (seconds < 90) return t('time.oneMinuteAgo');

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return minutes === 1
      ? t('time.oneMinuteAgo')
      : t('time.minutesAgo', { count: minutes });
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? t('time.oneHourAgo') : t('time.hoursAgo', { count: hours });
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return days === 1 ? t('time.oneDayAgo') : t('time.daysAgo', { count: days });
  }

  return new Date(value).toLocaleDateString(i18n.language);
};

/**
 * The absolute timestamp shown in the tooltip of a relative label.
 */
export const absoluteTime = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString(i18n.language);
};
