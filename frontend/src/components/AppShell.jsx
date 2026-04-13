/**
 * AppShell — 420px centered card container.
 * All screens render inside this wrapper.
 */
export default function AppShell({ children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      width: '420px',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}
