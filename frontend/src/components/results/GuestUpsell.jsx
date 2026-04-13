/**
 * GuestUpsell — subtle "Sign in to save history" prompt for unauthenticated users.
 * Shown below action buttons. NOT a blocking modal.
 */
export default function GuestUpsell({ onSignIn }) {
  return (
    <button
      onClick={onSignIn}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        marginTop: '12px',
        color: 'var(--blue)',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      Sign in to save your scan history →
    </button>
  );
}
