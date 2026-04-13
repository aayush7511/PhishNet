import { parseEmailText } from '../../utils/emailParser.js';

const clipboardSupported = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;

/**
 * ExtractButton — reads clipboard and parses email headers.
 * Disabled with tooltip if clipboard API is not available.
 *
 * @param {{ onExtract: (meta, body) => void, onError: (msg: string) => void }} props
 */
export default function ExtractButton({ onExtract, onError }) {
  async function handleClick() {
    try {
      const raw = await navigator.clipboard.readText();
      if (!raw.trim()) {
        onError('Clipboard is empty — copy an email first');
        return;
      }
      const { from, subject, date, body } = parseEmailText(raw);
      onExtract({ from, subject, date }, body || raw);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        onError('Clipboard access denied — allow clipboard permissions');
      } else {
        onError('Could not extract email from clipboard');
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!clipboardSupported}
      title={clipboardSupported ? 'Read email from clipboard' : 'Clipboard access not supported in this browser'}
      style={{
        width: '110px',
        height: '48px',
        background: '#1e2a3a',
        borderRadius: '12px',
        color: clipboardSupported ? 'var(--text-muted)' : 'var(--border)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        opacity: clipboardSupported ? 1 : 0.5,
      }}
    >
      EXTRACT
    </button>
  );
}
