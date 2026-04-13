/**
 * Format an ISO timestamp as a human-readable relative time string.
 * No external libraries — matches the spec exactly.
 *
 * @param {string} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const totalSeconds = Math.floor(diff / 1000);

  if (totalSeconds < 60) return 'just now';

  const mins = Math.floor(totalSeconds / 60);
  if (mins < 60) return `${mins} mins ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';

  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
