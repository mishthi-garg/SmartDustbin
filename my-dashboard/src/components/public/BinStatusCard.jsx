import { THRESHOLDS as T } from '../../utils/thresholds'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'

export default function BinStatusCard({ bin }) {
  if (!bin) return <p className="hint">Tap a bin on the map</p>

  const smelly = bin.odor_index >= T.odor.warn

  return (
    <section className="cards">
      <h3>{bin.name} <small>updated {timeAgo(bin.updated_at)}</small></h3>
      {smelly && <div className="odor-banner">⚠ Odor alert, avoid this area</div>}
      <div className="card-row">
        <div className="card"><span>Fill</span><b>{fmtPct(bin.fill_pct)}</b></div>
        <div className="card"><span>Temp</span><b>{fmtTemp(bin.temp_c)}</b></div>
        <div className="card"><span>Odor</span><b>{bin.odor_index ?? '--'}</b></div>
        <div className="card"><span>Animals</span><b>{bin.animal_alert ? 'Detected' : 'None'}</b></div>
      </div>
    </section>
  )
}