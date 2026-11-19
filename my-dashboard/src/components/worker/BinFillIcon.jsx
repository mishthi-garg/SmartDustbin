import { useId } from 'react'
import { Truck, Check, Flame } from 'lucide-react'

const COLORS = {
  emergency: '#ef4444', full: '#ef4444', collecting: 'var(--accent)',
  attention: '#eab308', ok: '#22c55e', done: '#22c55e',
}
// swap Truck for User or Footprints if pickups are done on foot
const BADGES = { emergency: Flame, collecting: Truck, done: Check }

const BODY = 'M6 8H22L20.6 27.2A2 2 0 0 1 18.6 29H9.4A2 2 0 0 1 7.4 27.2Z'

export default function BinFillIcon({ state, fill = 0 }) {
  const id = 'bf' + useId().replace(/:/g, '')      // each icon needs its own clipPath id
  const level = state === 'done' ? 0 : Math.min(100, Math.max(0, fill))
  const h = (level / 100) * 21                      // inner height of the bin body
  const Badge = BADGES[state]

  return (
    <span className="bin-icon">
      <svg width="28" height="32" viewBox="0 0 28 32">
        <defs><clipPath id={id}><path d={BODY} /></clipPath></defs>
        <path d={BODY} fill="#eef1f7" />
        <rect x="0" y={29 - h} width="28" height={h} clipPath={`url(#${id})`} style={{ fill: COLORS[state] }} />
        <path d="M11.5 12v13M16.5 12v13" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
        <path d={BODY} fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="4" y="3.5" width="20" height="3" rx="1.5" fill="#94a3b8" />
        <rect x="10.5" y="0.8" width="7" height="3" rx="1.2" fill="#94a3b8" />
      </svg>
      {Badge && (
        <span className={`bin-badge ${state}`}><Badge size={10} strokeWidth={3} /></span>
      )}
    </span>
  )
}