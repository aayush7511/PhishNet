/**
 * ResultsHeader — varies by risk_level (low / medium / high).
 */
export default function ResultsHeader({ riskLevel }) {
  const isHigh = riskLevel === 'high';
  const isMedium = riskLevel === 'medium';

  const shieldBg = isHigh ? 'var(--red-bg)' : 'var(--green-icon)';
  const dotColor = isHigh ? 'var(--red)' : isMedium ? 'var(--amber)' : 'var(--green)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: shieldBg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Phish Net</div>
          {isHigh ? (
            <div style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>HIGH RISK DETECTED</div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan complete.</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isMedium && (
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            SCAN COMPLETE
          </span>
        )}
        {isHigh && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        )}
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
      </div>
    </div>
  );
}
