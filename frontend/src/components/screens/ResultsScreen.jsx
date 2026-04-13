import ResultsHeader from '../results/ResultsHeader.jsx';
import ScoreDisplay from '../results/ScoreDisplay.jsx';
import FindingsList from '../results/FindingsList.jsx';
import ActionButtons from '../results/ActionButtons.jsx';
import GuestUpsell from '../results/GuestUpsell.jsx';

/**
 * ResultsScreen — displays analysis result for all three risk levels.
 * One component; risk_level prop drives appearance.
 */
export default function ResultsScreen({ result, isLoggedIn, user, onOpenProfile, onNewScan, setShowAuthModal }) {
  const { score, risk_level, risk_label, findings, ai_reasoning } = result;

  function handleSignIn() {
    setShowAuthModal(true);
  }

  return (
    <div style={{ padding: '20px' }}>
      <ResultsHeader riskLevel={risk_level} isLoggedIn={isLoggedIn} user={user} onOpenProfile={onOpenProfile} />
      <ScoreDisplay score={score} riskLevel={risk_level} riskLabel={risk_label} />
      <FindingsList findings={findings} aiReasoning={ai_reasoning} />
      <ActionButtons riskLevel={risk_level} onNewScan={onNewScan} />

      {!isLoggedIn && <GuestUpsell onSignIn={handleSignIn} />}

      {risk_level === 'high' && (
        <p style={{
          textAlign: 'center',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginTop: '16px',
        }}>
          PHISHGUARD V1.0 • SECURE TERMINAL PROTOCOL
        </p>
      )}
    </div>
  );
}
