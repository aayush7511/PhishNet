/**
 * ShieldPulse — animated shield icon shown during scanning.
 */
export default function ShieldPulse() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        background: '#1e2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'shieldPulse 2s ease-in-out infinite',
        position: 'relative',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {/* Dashed diamond border (pseudo via inline box-shadow effect) */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          border: '1.5px dashed var(--border)',
          borderRadius: '20px',
          animation: 'shieldPulse 2s ease-in-out infinite',
          animationDelay: '0.4s',
        }} />
      </div>

      <style>{`
        @keyframes shieldPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
