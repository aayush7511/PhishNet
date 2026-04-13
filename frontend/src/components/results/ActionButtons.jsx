/**
 * ActionButtons — varies by risk_level. NO "View full report" button anywhere.
 */
export default function ActionButtons({ riskLevel, onNewScan }) {
  if (riskLevel === 'low') {
    return (
      <button
        onClick={onNewScan}
        style={{
          width: '100%', height: '44px', background: 'var(--bg-row)',
          borderRadius: '10px', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontSize: '13px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
        </svg>
        New scan
      </button>
    );
  }

  if (riskLevel === 'medium') {
    return (
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={onNewScan}
          style={{
            color: 'var(--text-primary)', fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
          }}
        >
          NEW SCAN
        </button>
      </div>
    );
  }

  // high
  return (
    <button
      onClick={onNewScan}
      style={{
        width: '100%', height: '48px', background: '#1e2a3a',
        borderRadius: '10px', color: 'var(--text-muted)',
        fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
      }}
    >
      NEW SCAN
    </button>
  );
}
