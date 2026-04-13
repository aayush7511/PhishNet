import { useEffect, useState } from 'react';
import StepRow from '../scanning/StepRow.jsx';
import ProgressBar from '../scanning/ProgressBar.jsx';
import ShieldPulse from '../scanning/ShieldPulse.jsx';
import CancelButton from '../scanning/CancelButton.jsx';

const STEPS = [
  'Parsing email structure',
  'Extracting URLs',
  'Analyzing language patterns',
  'Checking sender domain',
  'Generating risk score',
];

// Progress bar widths per step index (0=none done, 5=all done)
const PROGRESS = [0, 20, 40, 70, 85, 100];

/**
 * ScanningScreen — shown while the /analyze request is in flight.
 *
 * @param {{ onCancel: () => void, fetchResolved: boolean }} props
 *   fetchResolved: set to true by App.jsx when the fetch promise settles.
 *   The screen then animates the remaining steps and transitions.
 */
export default function ScanningScreen({ onCancel, fetchResolved }) {
  // activeStep: index of the step currently RUNNING (0-4), -1 = not started
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = [];

    // Steps 0→1: deterministic parsing, fast
    timers.push(setTimeout(() => setActiveStep(1), 400));
    timers.push(setTimeout(() => setActiveStep(2), 900));
    // Step 2 stays RUNNING until fetch resolves (handled below)

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!fetchResolved) return;
    const timers = [];
    // Fetch done → advance through remaining steps
    setActiveStep(3);
    timers.push(setTimeout(() => setActiveStep(4), 300));
    timers.push(setTimeout(() => setActiveStep(5), 600)); // 5 = all done
    return () => timers.forEach(clearTimeout);
  }, [fetchResolved]);

  function getStatus(index) {
    if (index < activeStep) return 'done';
    if (index === activeStep) return 'active';
    return 'pending';
  }

  const progress = PROGRESS[Math.min(activeStep, 5)];

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
          PHISH NET
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-muted)',
          }}>
            SCAN COMPLETE
          </span>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)' }} />
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>
          Scanning...
        </h2>
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}>
          ANALYZING EMAIL CONTENT
        </p>
      </div>

      <ShieldPulse />

      <ProgressBar percent={progress} />

      {/* Steps */}
      <div>
        {STEPS.map((label, i) => (
          <StepRow key={label} label={label} status={getStatus(i)} />
        ))}
      </div>

      <CancelButton onClick={onCancel} />
    </div>
  );
}
