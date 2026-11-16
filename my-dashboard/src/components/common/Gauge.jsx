export default function Gauge({ value = 0, max = 100, label, sub, color = 'var(--accent)' }) {
  const len = Math.PI * 80                        // length of the half circle, r = 80
  const pct = Math.min(1, Math.max(0, value / max))

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 110">
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="gauge-track" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          className="gauge-fill"
          style={{ stroke: color, strokeDasharray: `${pct * len} ${len}` }}
        />
      </svg>
      <div className="gauge-center"><b>{label}</b><small>{sub}</small></div>
    </div>
  )
}