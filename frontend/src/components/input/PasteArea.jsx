import { useEffect } from 'react';

/**
 * PasteArea — the main email input zone.
 * Shows an empty-state hint when blank, or a textarea when filled.
 *
 * In the empty state, a global window 'paste' listener is used so that
 * Cmd+V / Ctrl+V works even though the div is not natively focusable.
 */
export default function PasteArea({ value, onChange }) {
  const isEmpty = !value;

  useEffect(() => {
    if (!isEmpty) return;
    function handleWindowPaste(e) {
      const text = e.clipboardData?.getData('text');
      if (text) onChange(text);
    }
    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isEmpty, onChange]);

  return (
    <div
      style={{
        background: 'var(--bg-input)',
        border: '1.5px dashed var(--border)',
        borderRadius: '12px',
        minHeight: '200px',
        display: 'flex',
        alignItems: isEmpty ? 'center' : 'stretch',
        justifyContent: isEmpty ? 'center' : 'stretch',
        position: 'relative',
        cursor: isEmpty ? 'default' : 'text',
      }}
    >
      {isEmpty ? (
        <div style={{ textAlign: 'center', pointerEvents: 'none', padding: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#1e2a3a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '15px', marginTop: '12px' }}>
            Paste email content...
          </p>
          <p style={{
            color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            CTRL+V TO PASTE
          </p>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            padding: '16px',
            resize: 'none',
            width: '100%',
            height: '200px',
            fontFamily: 'inherit',
            lineHeight: '1.5',
          }}
          placeholder="Email content..."
          maxLength={50000}
          autoFocus
        />
      )}
    </div>
  );
}
