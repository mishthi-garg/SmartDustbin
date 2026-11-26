import { useEffect, useState } from 'react'
import { fetchPerformance } from '../../services/workerService'

const level = (p) => (p == null ? 'unknown' : p >= 80 ? 'normal' : p >= 50 ? 'warning' : 'critical')
const fmtMin = (m) =>
  m == null ? '--' : m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)} min`

export default function WorkerPerformance() {
  const [days, setDays] = useState(7)
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    fetchPerformance(days).then((r) => alive && setRows(r))
    return () => { alive = false }
  }, [days])

  return (
    <>
      <div className="panel-row">
        <h1 className="page-title">Worker performance</h1>
        <div className="seg">
          <button className={days === 7 ? 'on' : ''} onClick={() => setDays(7)}>This week</button>
          <button className={days === 30 ? 'on' : ''} onClick={() => setDays(30)}>This month</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="bin-table">
          <thead>
            <tr>
              <th>Worker</th><th>Collections</th><th>Alerts</th><th>Avg response</th>
              <th>On time</th><th>Missed</th><th>Avg acknowledge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.worker_id}>
                <td><b>{r.name}</b></td>
                <td>{r.collections}</td>
                <td>{r.alerts}</td>
                <td>{fmtMin(r.avg_response_min)}</td>
                <td><span className={`pill ${level(r.on_time_pct)}`}>{r.on_time_pct == null ? '--' : `${r.on_time_pct}%`}</span></td>
                <td><span className={`pill ${r.missed > 0 ? 'critical' : 'normal'}`}>{r.missed}</span></td>
                <td>{fmtMin(r.avg_ack_min)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="hint">No data yet</p>}
      </div>

      <p className="def-note">
        <b>Response</b> = alert raised → bin collected. <b>On time</b> = collected within 60 min.
        <b> Missed</b> = no pickup within 3 hours. Only "full" and "odor" alerts count. Alerts are
        credited to whoever the bin was assigned to when the alert was raised.
      </p>
    </>
  )
}