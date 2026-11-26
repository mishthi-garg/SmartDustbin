import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useBinData } from '../../hooks/useBinData'
import { useWorkers } from '../../hooks/useWorkers'
import { useBinAssignments } from '../../hooks/useBinAssignments'
import { isOnShift, shiftLabel } from '../../utils/shifts'
import { setWorkerActive, reassignAll } from '../../services/workerService'
import WorkerForm from './WorkerForm'

export default function WorkerTable() {
  const { bins } = useBinData()
  const { workers, refresh } = useWorkers()
  const { assignments, refresh: refreshAssign } = useBinAssignments()
  const [editing, setEditing] = useState(null)      // 'new' | worker object
  const [moving, setMoving] = useState(null)        // worker whose bins are moving
  const [target, setTarget] = useState('')

  const binsOf = (id) => bins.filter((b) => assignments[b.id]?.worker_id === id)
  const reload = () => { refresh(); refreshAssign() }

  const toggleActive = async (w) => {
    const n = binsOf(w.id).length
    if (w.active && !window.confirm(
      `Deactivate ${w.name}?${n ? ` Their ${n} bin(s) will become unassigned.` : ''}`)) return
    const res = await setWorkerActive(w.id, !w.active)
    if (!res.ok) return window.alert(res.error)
    reload()
  }

  const doMove = async () => {
    const res = await reassignAll(moving.id, target)
    if (!res.ok) return window.alert(res.error)
    setMoving(null)
    setTarget('')
    reload()
  }

  return (
    <>
      <div className="panel-row">
        <div>
          <h1 className="page-title">Worker list</h1>
          <p className="panel-sub">Field workers don't sign in. Supervisors act on their behalf.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          <UserPlus size={16} /> Add worker
        </button>
      </div>

      <div className="table-wrap">
        <table className="bin-table">
          <thead>
            <tr><th>Worker</th><th>Contact</th><th>Shift</th><th>Bins</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {workers.map((w) => {
              const mine = binsOf(w.id)
              return (
                <tr key={w.id} className={w.active ? '' : 'row-off'}>
                  <td><b>{w.name}</b><br /><small className="muted">{w.employee_id ?? 'no ID'}</small></td>
                  <td>{w.phone ?? '--'}<br /><small className="muted">{w.email ?? ''}</small></td>
                  <td>{shiftLabel(w)}</td>
                  <td className="wrap">
                    {mine.length ? mine.map((b) => b.name).join(', ') : <span className="muted">None</span>}
                  </td>
                  <td>
                    {!w.active ? <span className="pill unknown">Inactive</span>
                      : isOnShift(w) ? <span className="pill normal">On shift</span>
                      : <span className="pill warning">Off shift</span>}
                  </td>
                  <td className="actions">
                    <button onClick={() => setEditing(w)}>Edit</button>
                    {w.active && mine.length > 0 && (
                      <button onClick={() => { setMoving(w); setTarget('') }}>Move bins</button>
                    )}
                    <button onClick={() => toggleActive(w)}>{w.active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!workers.length && <p className="hint">No workers yet. Add the first one.</p>}
      </div>

      {editing && (
        <div className="overlay">
          <WorkerForm
            worker={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload() }}
          />
        </div>
      )}

      {moving && (
        <div className="overlay">
          <div className="report-form">
            <h3>Move bins</h3>
            <p className="panel-sub">
              Move all {binsOf(moving.id).length} bin(s) from <b>{moving.name}</b> to:
            </p>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Choose a worker…</option>
              {workers.filter((w) => w.active && w.id !== moving.id).map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({shiftLabel(w)})</option>
              ))}
            </select>
            <div className="form-actions">
              <button type="button" onClick={() => setMoving(null)}>Cancel</button>
              <button type="button" className="btn-primary" disabled={!target} onClick={doMove}>Move</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}