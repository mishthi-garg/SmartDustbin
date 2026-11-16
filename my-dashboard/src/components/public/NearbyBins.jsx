import { useState } from 'react'
import { getBinStatus, STATUS_COLORS } from '../../utils/colorCode'
import { distanceM, fmtDist } from '../../utils/formatData'
import StatusDot from '../common/StatusDot'

const LABEL = { normal: 'Has space', warning: 'Filling up', critical: 'Full', emergency: 'Avoid' }

export default function NearbyBins({ bins, onSelect }) {
  const [pos, setPos] = useState(null)
  const [error, setError] = useState('')

  const locate = () => {
    if (!navigator.geolocation) return setError('Location not supported on this device')
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setError('') },
      () => setError('Location permission denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const rows = pos
    ? bins
        .map((b) => ({ ...b, status: getBinStatus(b), dist: distanceM(pos[0], pos[1], b.lat, b.lng) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4)
    : []
  const best = rows.find((r) => r.status === 'normal' || r.status === 'warning')

  return (
    <section id="nearby" className="panel">
      <div className="panel-head"><small>CLOSEST TO YOU</small><h3>Nearby bins</h3></div>

      {!pos ? (
        <>
          <button className="report-btn" onClick={locate}>📍 Use my location</button>
          {error && <p className="form-error">{error}</p>}
        </>
      ) : (
        <>
          {best && <p className="best">Closest bin with space: <b>{best.name}</b> ({fmtDist(best.dist)})</p>}
          <ul className="list">
            {rows.map((r) => (
              <li key={r.id} className="clickable" onClick={() => onSelect(r.id)}>
                <span><StatusDot color={STATUS_COLORS[r.status]} />{r.name}</span>
                <small>{LABEL[r.status]} · {fmtDist(r.dist)}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}