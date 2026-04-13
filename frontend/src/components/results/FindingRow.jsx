import { useState } from 'react';

const SEVERITY_COLORS = {
  HIGH: { dot: 'var(--red)',   badge: { bg: 'var(--red-bg)',   text: 'var(--red)' } },
  MED:  { dot: 'var(--amber)', badge: { bg: 'var(--amber-bg)', text: 'var(--amber)' } },
  LOW:  { dot: 'var(--amber)', badge: { bg: 'var(--amber-bg)', text: 'var(--amber)' } },
  PASS: { dot: 'var(--green)', badge: { bg: 'var(--green-bg)', text: 'var(--green)' } },
};

/**
 * FindingRow — single expandable finding.
 * @param {{ finding: { id, label, severity, detail, passed } }} props
 */
export default function FindingRow({ finding }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!finding.detail;
  const colors = SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.PASS;
  const borderColor = finding.severity === 'HIGH' ? 'var(--red)' : 'var(--amber)';

  return (
    <div
      onClick={() => hasDetail && setExpanded(e => !e)}
      style={{
        background: 'var(--bg-row)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '8px',
        cursor: hasDetail ? 'pointer' : 'default',
        borderLeft: expanded ? `2px solid ${borderColor}` : '2px solid transparent',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Severity dot */}
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: colors.dot, flexShrink: 0,
        }} />

        {/* Label */}
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {finding.label}
        </span>

        {/* Badge */}
        <span style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
          background: colors.badge.bg, color: colors.badge.text,
          letterSpacing: '0.05em',
        }}>
          {finding.severity}
        </span>

        {/* Chevron */}
        {hasDetail && (
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>
            {expanded ? '˅' : '›'}
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && finding.detail && (
        <div style={{
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontStyle: 'italic',
          padding: '8px 0 4px 22px',
          lineHeight: '1.5',
        }}>
          {finding.detail}
        </div>
      )}
    </div>
  );
}
