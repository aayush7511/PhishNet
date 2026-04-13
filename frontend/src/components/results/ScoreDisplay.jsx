/**
 * ScoreDisplay — the big score number + risk pill.
 * Layout differs by risk_level:
 *   low/medium: score above, label below
 *   high:       label above, score below
 */
export default function ScoreDisplay({ score, riskLevel, riskLabel }) {
  const isHigh = riskLevel === 'high';
  const scoreColor = isHigh ? 'var(--red)' : riskLevel === 'medium' ? 'var(--amber)' : 'var(--green)';
  const pillBg = isHigh ? 'var(--red-bg)' : riskLevel === 'medium' ? 'var(--amber-bg)' : 'var(--green-bg)';

  const pill = (
    <div style={{
      display: 'inline-block',
      background: pillBg,
      color: scoreColor,
      borderRadius: '8px',
      padding: '8px 20px',
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '0.03em',
      marginBottom: isHigh ? '8px' : '0',
      marginTop: isHigh ? '0' : '8px',
    }}>
      {riskLabel}
    </div>
  );

  const scoreEl = (
    <div style={{
      fontSize: '72px',
      fontWeight: 800,
      color: scoreColor,
      lineHeight: 1,
    }}>
      {score}
    </div>
  );

  const labelEl = (
    <div style={{
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--text-muted)',
      marginBottom: isHigh ? '4px' : '0',
      marginTop: isHigh ? '0' : '4px',
    }}>
      THREAT SCORE
    </div>
  );

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      {isHigh ? (
        <>
          {labelEl}
          {scoreEl}
          {pill}
        </>
      ) : (
        <>
          {scoreEl}
          {labelEl}
          {pill}
        </>
      )}
    </div>
  );
}
