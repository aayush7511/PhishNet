import { useEffect, useRef, useState } from 'react';
import AppShell from './components/AppShell.jsx';
import InputScreen from './components/screens/InputScreen.jsx';
import ScanningScreen from './components/screens/ScanningScreen.jsx';
import ResultsScreen from './components/screens/ResultsScreen.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import ProfilePanel from './components/profile/ProfilePanel.jsx';
import { analyzeEmail, getMe, logout } from './api/client.js';
import { useScanStats } from './hooks/useScanStats.js';

export default function App() {
  // -------------------------------------------------------------------------
  // Core state
  // -------------------------------------------------------------------------
  const [screen, setScreen] = useState('input');        // 'input' | 'scanning' | 'results'
  const [emailText, setEmailText] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [fetchResolved, setFetchResolved] = useState(false);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // AbortController ref for cancellable fetch
  const abortRef = useRef(null);

  // LocalStorage stats
  const { lastScan, scanCountToday, recordScan } = useScanStats();

  // -------------------------------------------------------------------------
  // Auth bootstrap on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    getMe().then(data => {
      if (data?.user) {
        setIsLoggedIn(true);
        setUser(data.user);
      }
    }).catch(() => { /* stay as guest */ });
  }, []);

  // -------------------------------------------------------------------------
  // Scan flow
  // -------------------------------------------------------------------------
  async function handleScan() {
    if (!emailText.trim()) return;

    abortRef.current = new AbortController();
    setFetchResolved(false);
    setScreen('scanning');

    try {
      const data = await analyzeEmail(emailText, abortRef.current.signal);

      // Signal ScanningScreen to finish its animation
      setFetchResolved(true);
      setScanResult(data);

      // Give the animation 900ms to complete before switching screens
      await new Promise(res => setTimeout(res, 900));

      recordScan(data.score);
      setScreen('results');
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled — return to input silently
        setScreen('input');
        return;
      }
      // Network or server error
      setScreen('input');
      // Surface error via a brief alert (could be a Toast in the InputScreen)
      console.error('Scan failed:', err.message);
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setScreen('input');
    setFetchResolved(false);
  }

  function handleNewScan() {
    setScanResult(null);
    setEmailText('');
    setFetchResolved(false);
    setScreen('input');
  }

  // -------------------------------------------------------------------------
  // Auth handlers
  // -------------------------------------------------------------------------
  function handleAuthSuccess(userData) {
    setIsLoggedIn(true);
    setUser(userData);
    setShowAuthModal(false);
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    setIsLoggedIn(false);
    setUser(null);
    setShowProfilePanel(false);
  }

  function openAuthModal(tab = 'login') {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <AppShell>
      {showProfilePanel ? (
        <ProfilePanel
          user={user}
          onClose={() => setShowProfilePanel(false)}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {screen === 'input' && (
            <InputScreen
              emailText={emailText}
              setEmailText={setEmailText}
              onScan={handleScan}
              isLoggedIn={isLoggedIn}
              user={user}
              onOpenProfile={() => setShowProfilePanel(true)}
              setShowAuthModal={() => openAuthModal('login')}
              lastScan={lastScan}
              scanCountToday={scanCountToday}
            />
          )}

          {screen === 'scanning' && (
            <ScanningScreen
              onCancel={handleCancel}
              fetchResolved={fetchResolved}
            />
          )}

          {screen === 'results' && scanResult && (
            <ResultsScreen
              result={scanResult}
              isLoggedIn={isLoggedIn}
              user={user}
              onOpenProfile={() => setShowProfilePanel(true)}
              onNewScan={handleNewScan}
              setShowAuthModal={() => openAuthModal('register')}
            />
          )}
        </>
      )}

      {showAuthModal && (
        <AuthModal
          defaultTab={authModalTab}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </AppShell>
  );
}
