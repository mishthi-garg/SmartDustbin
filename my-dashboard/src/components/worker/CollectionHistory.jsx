import { useEffect, useState } from 'react'
import { fetchHistory } from '../../services/alertService'

export default function CollectionHistory({ refreshKey, binId }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    fetchHistory().then((d) => alive && setRows(d))
    return () => { alive = false }
  }, [refreshKey])

  const visibleRows = binId ? rows.filter((row) => row.bin_id === binId) : rows

  if (!visibleRows.length) {
    const emptyMessage = binId ? 'No collections for this bin yet' : 'No collections logged yet'
    return <p className="hint">{emptyMessage}</p>
  }

  return (
    <div className="table-wrap">
      <table className="bin-table">
        <thead><tr><th>When</th><th>Bin</th><th>Collected by</th><th>Logged by</th><th>Fill before</th></tr></thead>
        <tbody>
          {visibleRows.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.collected_at).toLocaleString()}</td>
              <td>{r.bins?.name}</td>
              <td>{r.field_worker?.name ?? '--'}</td>
              <td>{r.worker_name}</td>
              <td>{r.fill_before != null ? `${r.fill_before}%` : '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}