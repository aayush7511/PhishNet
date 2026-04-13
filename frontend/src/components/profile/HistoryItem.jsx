import { timeAgo } from '../../utils/timeAgo.js';

const BADGE_COLORS = {
  high:   { bg: 'var(--red-bg)',   text: 'var(--red)',   label: 'HIGH' },
  medium: { bg: 'var(--amber-bg)', text: 'var(--amber)', label: 'MED'  },
  low:    { bg: 'var(--green-bg)', text: 'var(--green)', label: 'LOW'  },
};

/**
 * HistoryItem — a single scan row: score badge + risk label + relative time.
 */
export default function HistoryItem({ scan }) {
  const { score, risk_level, risk_label, created_at } = scan;
  const badge = BADGE_COLORS[risk_level] || BADGE_COLORS.low;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      background: 'var(--bg-row)',
      borderRadius: '8px',
      marginBottom: '6px',
    }}>
      {/* Score badge */}
      <div style={{
        minWidth: '36px',
        padding: '2px 6px',
        borderRadius: '6px',
        background: badge.bg,
        color: badge.text,
        fontSize: '12px',
        fontWeight: 700,
        textAlign: 'center',
      }}>
        {score}
      </div>

      {/* Risk label */}
      <div style={{
        flex: 1,
        fontSize: '13px',
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {risk_label}
      </div>

      {/* Time */}
      <div style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {timeAgo(created_at)}
      </div>
    </div>
  );
}
