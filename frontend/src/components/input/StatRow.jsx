/**
 * StatRow — a single labelled stat display row.
 * @param {{ label: string, value: string }} props
 */
export default function StatRow({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-row)',
      borderRadius: '8px',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px',
    }}>
      <span style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        fontWeight: 600,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  );
}
