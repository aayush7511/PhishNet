import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthTabs from './AuthTabs.jsx';
import AuthForm from './AuthForm.jsx';

/**
 * AuthModal — login/register modal overlay.
 * Rendered via portal into document.body.
 * Closes on Escape or backdrop click.
 */
export default function AuthModal({ onClose, defaultTab = 'login', onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSuccess(user) {
    onAuthSuccess(user);
    onClose();
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          width: '360px',
          maxWidth: '90vw',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            fontSize: '20px',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          PhishNet Account
        </h2>

        <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <AuthForm mode={activeTab} onSuccess={handleSuccess} />
      </div>
    </div>,
    document.body,
  );
}
