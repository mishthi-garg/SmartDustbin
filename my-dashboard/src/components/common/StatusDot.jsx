export default function StatusDot({ color = '#22c55e', pulse = false }) {
  return (
    <span
      className={`status-dot ${pulse ? 'pulse' : ''}`}
      style={{ background: color, color }}
    />
  )
}