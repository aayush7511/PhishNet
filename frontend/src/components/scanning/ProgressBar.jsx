/**
 * ProgressBar — thin horizontal bar showing scan progress.
 * @param {{ percent: number }} props  0-100
 */
export default function ProgressBar({ percent }) {
  return (
    <div style={{
      height: '3px',
      background: 'var(--border)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '20px',
    }}>
      <div style={{
        height: '100%',
        background: 'var(--blue)',
        width: `${percent}%`,
        transition: 'width 0.4s ease',
        borderRadius: '2px',
      }} />
    </div>
  );
}
