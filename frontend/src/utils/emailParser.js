/**
 * Parse raw clipboard email text into its component parts.
 *
 * Supports standard RFC 2822-style headers (From:, Subject:, Date:)
 * and extracts the body as everything after the first blank line
 * following the header block.
 *
 * @param {string} rawText
 * @returns {{ from: string|null, subject: string|null, date: string|null, body: string }}
 */
export function parseEmailText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { from: null, subject: null, date: null, body: '' };
  }

  const lines = rawText.split('\n');

  const extract = (header) => {
    const re = new RegExp(`^${header}:\\s*(.+)$`, 'im');
    const m = rawText.match(re);
    return m ? m[1].trim() : null;
  };

  const from = extract('From');
  const subject = extract('Subject');
  const date = extract('Date');

  // Body = everything after the first blank line
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      bodyStart = i + 1;
      break;
    }
  }
  const body = lines.slice(bodyStart).join('\n').trim();

  return { from, subject, date, body };
}
