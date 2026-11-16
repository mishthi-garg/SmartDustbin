import { useEffect, useState } from 'react'
import { fetchHistory } from '../../services/alertService'

export default function CollectionHistory({ refreshKey }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    fetchHistory().then((d) => alive && setRows(d))
    return () => { alive = false }
  }, [refreshKey])

  if (!rows.length) return <p className="hint">No collections logged yet</p>

  return (
    <div className="table-wrap">
      <table className="bin-table">
        <thead><tr><th>When</th><th>Bin</th><th>Worker</th><th>Fill before</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.collected_at).toLocaleString()}</td>
              <td>{r.bins?.name}</td>
              <td>{r.worker_name}</td>
              <td>{r.fill_before != null ? `${r.fill_before}%` : '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}