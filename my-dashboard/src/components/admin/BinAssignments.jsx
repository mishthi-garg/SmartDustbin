import { useState } from 'react'
import { useBinData } from '../../hooks/useBinData'
import { useWorkers } from '../../hooks/useWorkers'
import { useBinAssignments } from '../../hooks/useBinAssignments'
import { assignBin } from '../../services/workerService'

export default function BinAssignments() {
  const { bins } = useBinData()
  const { workers } = useWorkers({ onlyActive: true })
  const { assignments, refresh } = useBinAssignments()
  const [busy, setBusy] = useState(null)

  const change = async (binId, workerId) => {
    setBusy(binId)
    const res = await assignBin(binId, workerId || null)
    setBusy(null)
    if (!res.ok) return window.alert(res.error)
    refresh()
  }

  return (
    <>
      <h1 className="page-title">Bin assignments</h1>
      <p className="panel-sub">Alerts raised from now on are credited to the worker assigned at that moment.</p>

      <div className="table-wrap">
        <table className="bin-table">
          <thead><tr><th>Bin</th><th>Type</th><th>Assigned worker</th></tr></thead>
          <tbody>
            {[...bins].sort((a, b) => a.name.localeCompare(b.name)).map((b) => (
              <tr key={b.id}>
                <td><b>{b.name}</b></td>
                <td>{(b.kind ?? 'dry') === 'wet' ? 'Wet' : 'Dry'}</td>
                <td>
                  <select className="assign-select" disabled={busy === b.id}
                    value={assignments[b.id]?.worker_id ?? ''}
                    onChange={(e) => change(b.id, e.target.value)}>
                    <option value="">Unassigned</option>
                    {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}