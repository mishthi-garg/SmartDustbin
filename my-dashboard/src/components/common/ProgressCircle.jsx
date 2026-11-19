const COLORS = {
  emergency: 'var(--bad)', full: 'var(--bad)', collecting: 'var(--accent)',
  attention: 'var(--warn)', ok: 'var(--ok)', done: 'var(--ok)',
}

export default function ProgressCircle({ state, fill = 0, size = 26 }) {
  const r = 9
  const len = 2 * Math.PI * r
  const color = COLORS[state]

  if (state === 'done') {
    return (
      <svg className="pc" width={size} height={size} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill={color} />
        <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  // collecting = short arc that spins; every other state = arc length is the fill %
  const frac = state === 'collecting' ? 0.28 : Math.min(1, Math.max(0, fill / 100))
  const cls = `pc ${state === 'collecting' ? 'pc-spin' : ''} ${state === 'emergency' ? 'pc-pulse' : ''}`

  return (
    <svg className={cls} width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#e6e9f2" strokeWidth="3" />
      <circle cx="12" cy="12" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round" strokeDasharray={`${frac * len} ${len}`}
        transform="rotate(-90 12 12)" />
    </svg>
  )
}