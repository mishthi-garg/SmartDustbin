import { ALERT_META } from '../../utils/thresholds'
import { timeAgo } from '../../utils/formatData'

export default function AlertFeed({ alerts, bins, onResolve }) {
  const nameOf = (id) => bins.find((b) => b.id === id)?.name ?? id

  if (!alerts.length) return <p className="hint">No active alerts 🎉</p>

  return (
    <ul className="alert-list">
      {alerts.map((a) => {
        const meta = ALERT_META[a.type]
        return (
          <li key={a.id} className={`alert-item sev-${a.severity}`}>
            <span className="alert-icon">{meta.icon}</span>
            <div className="alert-body">
              <b>{meta.label}</b> · {nameOf(a.bin_id)}
              <small>{a.message} · {timeAgo(a.created_at)}</small>
            </div>
            {!a.derived && <button onClick={() => onResolve(a.id)}>Resolve</button>}
          </li>
        )
      })}
    </ul>
  )
}