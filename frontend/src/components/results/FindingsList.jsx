import FindingRow from './FindingRow.jsx';

/**
 * FindingsList — renders all finding rows + the AI reasoning footer.
 */
export default function FindingsList({ findings, aiReasoning }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {findings.map(finding => (
        <FindingRow key={finding.id} finding={finding} />
      ))}

      {aiReasoning && aiReasoning !== 'AI analysis unavailable' && (
        <div style={{
          background: 'var(--bg-row)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginTop: '4px',
        }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            AI REASONING
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {aiReasoning}
          </p>
        </div>
      )}
    </div>
  );
}
