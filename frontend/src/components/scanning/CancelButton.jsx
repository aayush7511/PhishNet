/**
 * CancelButton — aborts the in-flight scan and returns to InputScreen.
 */
export default function CancelButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: '44px',
        background: 'var(--bg-row)',
        borderRadius: '10px',
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginTop: '8px',
      }}
    >
      CANCEL
    </button>
  );
}
