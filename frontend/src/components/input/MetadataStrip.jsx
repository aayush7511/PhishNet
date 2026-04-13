/**
 * MetadataStrip — shown after Extract succeeds.
 * Displays From and Subject in a compact info bar above the paste area.
 *
 * @param {{ meta: { from: string|null, subject: string|null }, onDismiss: () => void }} props
 */
export default function MetadataStrip({ meta, onDismiss }) {
  if (!meta) return null;

  const parts = [];
  if (meta.from) parts.push(`From: ${meta.from}`);
  if (meta.subject) parts.push(`Subject: ${meta.subject}`);
  const text = parts.join('  ·  ');

  return (
    <div style={{
      background: 'var(--bg-row)',
      borderRadius: '8px',
      padding: '10px 14px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
    }}>
      <span style={{
        color: 'var(--text-secondary)',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {text || 'Email extracted from clipboard'}
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          color: 'var(--text-muted)',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
}
