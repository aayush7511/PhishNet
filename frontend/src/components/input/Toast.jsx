import { useEffect } from 'react';

/**
 * Auto-dismissing toast notification.
 * @param {{ message: string, visible: boolean, onHide: () => void }} props
 */
export default function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      background: '#1e2a3a',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--red)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: 'var(--text-secondary)',
      fontSize: '13px',
      maxWidth: '300px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  );
}
