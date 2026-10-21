/**
 * Shared time helpers.
 *
 * Kept in its own module so both the header bell, the notifications page and
 * the admin panels can format timestamps without importing each other.
 */

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

  if (seconds < 45) return 'just now';
  if (seconds < 90) return '1 min ago';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(value).toLocaleDateString();
};

/**
 * The absolute timestamp shown in the tooltip of a relative label.
 */
export const absoluteTime = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString();
};
