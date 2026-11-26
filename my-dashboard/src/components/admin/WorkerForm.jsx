import { useState } from 'react'
import { saveWorker } from '../../services/workerService'
import { SHIFT_PRESETS } from '../../utils/shifts'

export default function WorkerForm({ worker, onClose, onSaved }) {
  const [f, setF] = useState({
    name: worker?.name ?? '',
    employee_id: worker?.employee_id ?? '',
    phone: worker?.phone ?? '',
    email: worker?.email ?? '',
    shift_start: worker?.shift_start?.slice(0, 5) ?? '06:00',
    shift_end: worker?.shift_end?.slice(0, 5) ?? '14:00',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const preset = (key) => {
    const [s, e] = SHIFT_PRESETS[key]
    setF((p) => ({ ...p, shift_start: s, shift_end: e }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await saveWorker({ ...f, id: worker?.id })
    setBusy(false)
    if (res.ok) onSaved()
    else setError(res.error)
  }

  return (
    <form className="report-form" onSubmit={onSubmit}>
      <h3>{worker ? 'Edit worker' : 'Add worker'}</h3>
      <label>Name<input value={f.name} onChange={set('name')} required /></label>
      <label>Employee ID<input value={f.employee_id} onChange={set('employee_id')} /></label>
      <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
      <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>

      <label>Shift (IST)</label>
      <div className="preset-row">
        {Object.keys(SHIFT_PRESETS).map((k) => (
          <button type="button" key={k} onClick={() => preset(k)}>{k[0].toUpperCase() + k.slice(1)}</button>
        ))}
      </div>
      <div className="shift-row">
        <input type="time" value={f.shift_start} onChange={set('shift_start')} required />
        <span>to</span>
        <input type="time" value={f.shift_end} onChange={set('shift_end')} required />
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )
}