import { useState, useCallback } from 'react';
import PasteArea from '../input/PasteArea.jsx';
import MetadataStrip from '../input/MetadataStrip.jsx';
import StatRow from '../input/StatRow.jsx';
import ScanButton from '../input/ScanButton.jsx';
import ExtractButton from '../input/ExtractButton.jsx';
import Toast from '../input/Toast.jsx';
import ProfileButton from '../profile/ProfileButton.jsx';
import { timeAgo } from '../../utils/timeAgo.js';

/**
 * InputScreen — the main landing screen where users paste and scan emails.
 */
export default function InputScreen({
  emailText,
  setEmailText,
  onScan,
  isLoggedIn,
  user,
  onOpenProfile,
  setShowAuthModal,
  lastScan,
  scanCountToday,
}) {
  const [extractedMeta, setExtractedMeta] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(t => ({ ...t, visible: false }));
  }, []);

  function handleExtract(meta, body) {
    setExtractedMeta(meta);
    setEmailText(body);
  }

  // Last scan display: "87 · 2 mins ago" or "—"
  const lastScanDisplay = lastScan
    ? `${lastScan.score} · ${timeAgo(lastScan.timestamp)}`
    : '—';

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--green-icon)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              PHISH NET
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Security Scanner</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoggedIn && user ? (
            <ProfileButton username={user.username} onClick={onOpenProfile} />
          ) : (
            <button
              onClick={setShowAuthModal}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--blue)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-row)';
                e.currentTarget.style.borderColor = 'var(--blue)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Extracted metadata strip */}
      {extractedMeta && (
        <MetadataStrip meta={extractedMeta} onDismiss={() => setExtractedMeta(null)} />
      )}

      {/* Paste area */}
      <div style={{ marginBottom: '16px' }}>
        <PasteArea value={emailText} onChange={setEmailText} />
      </div>

      {/* Stats */}
      <div style={{ marginBottom: '16px' }}>
        <StatRow label="LAST SCAN" value={lastScanDisplay} />
        <StatRow label="EMAILS SCANNED TODAY" value={String(scanCountToday)} />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <ScanButton disabled={!emailText.trim()} onClick={onScan} />
        <ExtractButton onExtract={handleExtract} onError={showToast} />
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
      }}>
        SOVEREIGN TERMINAL V1.0
      </p>

      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </div>
  );
}
