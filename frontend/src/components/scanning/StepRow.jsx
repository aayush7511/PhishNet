/**
 * StepRow — one item in the scanning step list.
 * @param {{ label: string, status: 'pending'|'active'|'done' }} props
 */
export default function StepRow({ label, status }) {
  const isDone = status === 'done';
  const isActive = status === 'active';

  return (
    <div style={{
      background: 'var(--bg-row)',
      borderRadius: '10px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
      border: isActive ? '1px solid var(--blue)' : '1px solid transparent',
      transition: 'border-color 0.3s',
    }}>
      {/* Left icon */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDone ? 'var(--green-icon)' : isActive ? 'transparent' : '#1e2a3a',
        border: isActive ? '2px solid var(--blue)' : 'none',
        borderTopColor: isActive ? 'transparent' : undefined,
        animation: isActive ? 'spin 0.8s linear infinite' : 'none',
      }}>
        {isDone && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: isDone ? 500 : isActive ? 700 : 400,
        color: isActive ? 'var(--blue)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
      }}>
        {label}
      </span>

      {/* Status badge */}
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: isDone ? 'var(--green)' : isActive ? 'var(--blue)' : 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {isDone ? 'DONE' : isActive ? 'RUNNING' : 'QUEUED'}
      </span>
    </div>
  );
}
