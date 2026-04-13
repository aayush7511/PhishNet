import { useEffect, useState } from 'react';
import { getHistory } from '../../api/client.js';
import HistoryItem from './HistoryItem.jsx';

/**
 * ProfilePanel — slide-in account panel with user info, scan history, and sign out.
 */
export default function ProfilePanel({ user, onClose, onLogout }) {
  const [history, setHistory] = useState(null); // null=loading, []=loaded
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    getHistory()
      .then(data => setHistory(data.scans || []))
      .catch(() => setHistoryError(true));
  }, []);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '';

  async function handleSignOut() {
    await onLogout();
    onClose();
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            padding: '4px 0',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
        }}>
          Account
        </span>

        <div style={{ width: '44px' }} />
      </div>

      {/* Account info */}
      <div style={{
        background: 'var(--bg-row)',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--blue-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
          border: '1.5px solid var(--blue)',
        }}>
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            {user?.username}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {user?.email}
          </div>
          {memberSince && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Member since {memberSince}
            </div>
          )}
        </div>
      </div>

      {/* Scan history */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
          }}>
            Scan History
          </span>
          {history && history.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              last {Math.min(history.length, 10)}
            </span>
          )}
        </div>

        {/* Loading state */}
        {history === null && !historyError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '42px',
                borderRadius: '8px',
                background: 'var(--bg-row)',
                opacity: 0.5,
              }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {historyError && (
          <div style={{
            padding: '14px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            background: 'var(--bg-row)',
            borderRadius: '8px',
          }}>
            Could not load history
          </div>
        )}

        {/* Empty state */}
        {history !== null && !historyError && history.length === 0 && (
          <div style={{
            padding: '20px 14px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            background: 'var(--bg-row)',
            borderRadius: '8px',
            lineHeight: '1.5',
          }}>
            No scans yet —<br />run your first scan!
          </div>
        )}

        {/* History list */}
        {history !== null && !historyError && history.length > 0 && (
          <div>
            {history.slice(0, 10).map(scan => (
              <HistoryItem key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--red)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        Sign out
      </button>
    </div>
  );
}
