import { useState } from 'react'
import { submitReport } from '../../services/issueService'

const ISSUE_TYPES = [
  { value: 'overflow', label: 'Overflowing' },
  { value: 'odor', label: 'Bad smell' },
  { value: 'damaged', label: 'Damaged bin' },
  { value: 'animals', label: 'Animals around' },
  { value: 'other', label: 'Other' },
]

export default function ReportForm({ bins, defaultBinId, onClose }) {
  const [binId, setBinId] = useState(defaultBinId || bins[0]?.id)
  const [issueType, setIssueType] = useState('overflow')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [honey, setHoney] = useState('')          // bot trap, humans never see it
  const [status, setStatus] = useState('idle')    // idle | sending | done | error
  const [error, setError] = useState('')

  const onPhoto = (e) => {
    const f = e.target.files[0]
    if (!f) return setPhoto(null)
    if (!f.type.startsWith('image/')) return setError('Please pick an image')
    if (f.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB')
    setError('')
    setPhoto(f)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (honey) return                              // a bot filled it, silently drop
    setStatus('sending')
    const res = await submitReport({ binId, issueType, description, photo })
    if (res.ok) setStatus('done')
    else { setStatus('error'); setError(res.error) }
  }

  if (status === 'done') {
    return (
      <div className="report-form">
        <p>✅ Thanks! The report was sent to the campus team.</p>
        <button onClick={onClose}>Close</button>
      </div>
    )
  }

  return (
    <form className="report-form" onSubmit={onSubmit}>
      <h3>Report a bin issue</h3>

      <label>Which bin
        <select value={binId} onChange={(e) => setBinId(e.target.value)}>
          {bins.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>

      <label>Issue
        <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
          {ISSUE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>

      <label>Details (optional)
        <textarea
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label>Photo (optional)
        <input type="file" accept="image/*" capture="environment" onChange={onPhoto} />
      </label>

      <input
        className="honey" tabIndex={-1} autoComplete="off"
        value={honey} onChange={(e) => setHoney(e.target.value)}
      />

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}