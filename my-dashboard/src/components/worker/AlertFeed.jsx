import { useState } from 'react'
import { ALERT_META } from '../../utils/thresholds'
import { timeAgo } from '../../utils/formatData'

function AckControl({ alert, workers, onAck }) {
  const [wid, setWid] = useState(alert.assigned_worker_id ?? '')
  return (
    <span className="ack-control">
      <select value={wid} onChange={(e) => setWid(e.target.value)}>
        <option value="">Who?</option>
        {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <button disabled={!wid} onClick={() => onAck(alert.id, wid)}>Acknowledge</button>
    </span>
  )
}

export default function AlertFeed({ alerts, bins, workers = [], onResolve, onAck }) {
  const nameOf = (id) => bins.find((b) => b.id === id)?.name ?? id
  const workerName = (id) => workers.find((w) => w.id === id)?.name ?? 'a worker'

  if (!alerts.length) return <p className="hint">No active alerts 🎉</p>

  return (
    <ul className="alert-list">
      {alerts.map((a) => {
        const meta = ALERT_META[a.type]
        const canAck = !a.derived && !a.acknowledged_at && onAck && workers.length > 0 && a.type !== 'battery'
        return (
          <li key={a.id} className={`alert-item sev-${a.severity}`}>
            <span className="alert-icon">{meta.icon}</span>
            <div className="alert-body">
              <span><b>{meta.label}</b> · {nameOf(a.bin_id)}</span>
              <small>{a.message} · {timeAgo(a.created_at)}</small>
              {a.acknowledged_at && (
                <small className="ack-line">
                  ✓ Acknowledged by {workerName(a.acknowledged_worker_id)} ·{' '}
                  {Math.round((new Date(a.acknowledged_at) - new Date(a.created_at)) / 60000)} min after alert
                </small>
              )}
            </div>
            {canAck && <AckControl alert={a} workers={workers} onAck={onAck} />}
            {!a.derived && onResolve && <button onClick={() => onResolve(a.id)}>Resolve</button>}
          </li>
        )
      })}
    </ul>
  )
}