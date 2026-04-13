/**
 * ProfileButton — 32×32 avatar circle showing the first letter of the username.
 * Rendered in the header when the user is logged in.
 */
export default function ProfileButton({ username, onClick }) {
  const letter = username ? username[0].toUpperCase() : '?';

  return (
    <button
      onClick={onClick}
      title={`Signed in as ${username}`}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--blue-dark)',
        color: 'white',
        fontWeight: 700,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1.5px solid var(--blue)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {letter}
    </button>
  );
}
