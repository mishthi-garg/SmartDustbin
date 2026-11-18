import { STATUS_PILL, STATUS_LABEL } from '../../utils/sensorHealth'

export default function DeviceHealth({ metrics, binName }) {
  return (
    <section className="panel">
      <div className="panel-head"><small>{binName?.toUpperCase()}</small><h3>Device (ESP32)</h3></div>
      <div className="device-grid">
        {metrics.map((m) => (
          <div key={m.key} className={`metric ${m.status}`}>
            <span className="metric-label">{m.label.toUpperCase()}</span>
            <b>{m.value}</b>
            <span className={`pill ${STATUS_PILL[m.status]}`}>{STATUS_LABEL[m.status]}</span>
            <small>{m.detail}</small>
          </div>
        ))}
      </div>
    </section>
  )
}