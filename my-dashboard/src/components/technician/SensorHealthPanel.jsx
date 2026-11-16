import { Ruler, Wind, Thermometer, PawPrint } from 'lucide-react'
import { HEALTH_COLORS } from '../../utils/sensorHealth'

const ICONS = { fill: Ruler, odor: Wind, temp: Thermometer, motion: PawPrint }
const PILL = { online: 'normal', warning: 'warning', offline: 'critical' }
const LABEL = { online: 'Online', warning: 'Check', offline: 'Offline' }

const valueText = (s) =>
  s.value == null ? '--' : s.boolean ? (s.value ? 'Detected' : 'Idle') : `${s.value}${s.unit}`
const rangeText = (s) =>
  s.boolean ? 'normal: idle' : `normal: ${s.normal[0]}–${s.normal[1]}${s.unit}`

// how far round the ring: where the value sits inside its valid range
function ringFraction(s) {
  if (s.status === 'offline') return 0
  if (s.boolean) return 1
  const [lo, hi] = s.valid
  return Math.min(1, Math.max(0, (s.value - lo) / (hi - lo)))
}

function SensorCircle({ s }) {
  const Icon = ICONS[s.key]
  const r = 30
  const len = 2 * Math.PI * r

  return (
    <div className={`sensor ${s.status}`} title={s.note}>
      <div className="sensor-ring">
        <svg viewBox="0 0 72 72">
          <circle className="ring-track" cx="36" cy="36" r={r} />
          <circle
            className="ring-arc" cx="36" cy="36" r={r}
            style={{ stroke: HEALTH_COLORS[s.status], strokeDasharray: `${ringFraction(s) * len} ${len}` }}
          />
        </svg>
        <span className="ring-icon" style={{ color: HEALTH_COLORS[s.status] }}>
          <Icon size={22} />
        </span>
      </div>
      <b>{s.model}</b>
      <small>{s.label}</small>
      <span className="reading">{valueText(s)}</span>
      <small>{rangeText(s)}</small>
      <span className={`pill ${PILL[s.status]}`}>{LABEL[s.status]}</span>
      {s.status !== 'online' && <small className="sensor-note">{s.note}</small>}
    </div>
  )
}

export default function SensorHealthPanel({ sensors, binName }) {
  const online = sensors.filter((s) => s.status === 'online').length

  return (
    <section className="panel">
      <div className="panel-row">
        <div className="panel-head"><small>{binName?.toUpperCase()}</small><h3>Sensors</h3></div>
        <span className="count-chip">{online} of {sensors.length} online</span>
      </div>
      <div className="sensor-grid">
        {sensors.map((s) => <SensorCircle key={s.key} s={s} />)}
      </div>
    </section>
  )
}