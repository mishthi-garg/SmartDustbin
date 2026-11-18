import { Ruler, Wind, Thermometer, PawPrint } from 'lucide-react'
import { HEALTH_COLORS, STATUS_PILL, STATUS_LABEL } from '../../utils/sensorHealth'
import { timeAgo } from '../../utils/formatData'

const ICONS = { fill: Ruler, odor: Wind, temp: Thermometer, motion: PawPrint }

function SensorCircle({ s }) {
  const Icon = ICONS[s.key]
  const r = 30
  const len = 2 * Math.PI * r
  const frac = Math.min(1, s.validity / 100)       // ring = share of valid reads

  return (
    <div className={`sensor ${s.status}`}>
      <div className="sensor-ring">
        <svg viewBox="0 0 72 72">
          <circle className="ring-track" cx="36" cy="36" r={r} />
          <circle
            className="ring-arc" cx="36" cy="36" r={r}
            style={{ stroke: HEALTH_COLORS[s.status], strokeDasharray: `${frac * len} ${len}` }}
          />
        </svg>
        <span className="ring-icon" style={{ color: HEALTH_COLORS[s.status] }}><Icon size={22} /></span>
      </div>

      <b>{s.model}</b>
      <small>{s.label}</small>
      <span className="reading">{Math.round(s.validity)}% valid</span>
      {!s.boolean && (
        <small>{s.noise == null ? 'noise: n/a' : `noise ±${s.noise.toFixed(1)} (max ${s.maxNoise})`}</small>
      )}
      <small>last valid: {s.lastValidAt ? timeAgo(s.lastValidAt) : 'never'}</small>
      <span className={`pill ${STATUS_PILL[s.status]}`}>{STATUS_LABEL[s.status]}</span>
      {s.status !== 'online' && <small className="sensor-note">{s.note}</small>}
    </div>
  )
}

export default function SensorHealthPanel({ sensors, binName }) {
  const ok = sensors.filter((s) => s.status === 'online').length

  return (
    <section className="panel">
      <div className="panel-row">
        <div className="panel-head"><small>{binName?.toUpperCase()}</small><h3>Sensors</h3></div>
        <span className="count-chip">{ok} of {sensors.length} healthy</span>
      </div>
      <div className="sensor-grid">
        {sensors.map((s) => <SensorCircle key={s.key} s={s} />)}
      </div>
    </section>
  )
}