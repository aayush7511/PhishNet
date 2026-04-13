/**
 * AuthTabs — "Sign in" / "Create account" tab switcher.
 */
export default function AuthTabs({ activeTab, setActiveTab }) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      marginBottom: '20px',
    }}>
      {['login', 'register'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === tab ? '2px solid var(--blue)' : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'color 0.2s',
          }}
        >
          {tab === 'login' ? 'Sign in' : 'Create account'}
        </button>
      ))}
    </div>
  );
}
