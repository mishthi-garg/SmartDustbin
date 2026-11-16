import Gauge from '../common/Gauge'
import { HEALTH_COLORS } from '../../utils/sensorHealth'

export default function SensorGauge({ title, value, level, sub, scale }) {
  return (
    <section className="panel">
      <div className="panel-head"><h3>{title}</h3></div>
      <Gauge
        value={value ?? 0}
        label={value == null ? '--' : `${value}%`}
        sub={sub}
        color={HEALTH_COLORS[level]}
      />
      {scale && (
        <div className="gauge-scale">{scale.map((s) => <span key={s}>{s}</span>)}</div>
      )}
    </section>
  )
}