/**
 * ScanButton — primary CTA. Disabled when email text is empty.
 */
export default function ScanButton({ disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        height: '48px',
        background: disabled ? 'var(--blue-dark)' : 'var(--blue-dark)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      SCAN EMAIL
    </button>
  );
}
