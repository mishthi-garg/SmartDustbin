import { useEffect, useState } from 'react'
import { fetchAlertHistory } from '../../services/workerService'
import { ALERT_META } from '../../utils/thresholds'

const mins = (r) =>
  Math.round((new Date(r.acknowledged_at) - new Date(r.created_at)) / 60000)

export default function AlertHistory() {
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('all')

  useEffect(() => {
    let alive = true
    fetchAlertHistory().then((r) => alive && setRows(r))
    return () => { alive = false }
  }, [])

  const shown = rows.filter((r) =>
    tab === 'all' ? true
    : tab === 'unack' ? !r.acknowledged_at && r.type !== 'battery'
    : !!r.resolved_at)

  return (
    <>
      <div className="panel-row">
        <h1 className="page-title">Alert history</h1>
        <div className="seg">
          {[['all', 'All'], ['unack', 'Unacknowledged'], ['done', 'Resolved']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="bin-table">
          <thead>
            <tr><th>When</th><th>Bin</th><th>Alert</th><th>Assigned to</th><th>Acknowledged by</th><th>Ack delay</th><th>Status</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const m = ALERT_META[r.type] ?? { icon: '•', label: r.type }
              return (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.bins?.name}</td>
                  <td>{m.icon} {m.label}</td>
                  <td>{r.assigned?.name ?? <span className="muted">Unassigned</span>}</td>
                  <td>{r.acked?.name ?? <span className="muted">Not acknowledged</span>}</td>
                  <td>{r.acknowledged_at ? `${mins(r)} min` : '--'}</td>
                  <td>
                    {r.resolved_at
                      ? <span className="pill normal">Resolved</span>
                      : <span className={`pill ${r.type === 'fire' ? 'critical' : 'warning'}`}>Open</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!shown.length && <p className="hint">Nothing here</p>}
      </div>
    </>
  )
}