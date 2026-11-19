import { ALERT_META } from '../../utils/thresholds'
import { STATE_LABEL } from '../../utils/colorCode'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'

export default function BinDetails({ bin, alerts, onClose }) {
  const mine = alerts.filter((a) => a.bin_id === bin.id)
  const rows = [
    ['Status', STATE_LABEL[bin.state]],
    ['Assigned to', bin.worker ?? 'Unassigned'],
    ['Fill level', fmtPct(bin.fill_pct)],
    ['Odor index', bin.odor_index ?? '--'],
    ['Temperature', fmtTemp(bin.temp_c)],
    ['Animal activity', bin.animal_alert ? 'Detected' : 'None'],
    ['Smoke', bin.smoke ? 'DETECTED' : 'None'],
    ['Last reading', timeAgo(bin.updated_at)],
    ['Last collected', timeAgo(bin.last_collected_at)],
  ]

  return (
    <div className="report-form">
      <h3>{bin.name}</h3>
      <dl className="kv">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>

      <h4 className="kv-title">Open alerts</h4>
      {mine.length ? (
        <ul className="plain-list">
          {mine.map((a) => (
            <li key={a.id}>
              {ALERT_META[a.type].icon} {ALERT_META[a.type].label}: {a.message} · {timeAgo(a.created_at)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">None</p>
      )}

      <div className="form-actions"><button type="button" onClick={onClose}>Close</button></div>
    </div>
  )
}