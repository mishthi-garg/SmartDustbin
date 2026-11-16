import { THRESHOLDS as T } from '../../utils/thresholds'

export default function OdorAdvisories({ bins, onSelect }) {
  const list = bins
    .filter((b) => b.odor_index >= T.odor.warn)
    .sort((a, b) => b.odor_index - a.odor_index)

  return (
    <section id="advisories" className="panel">
      <div className="panel-head"><small>AIR QUALITY</small><h3>Odor advisories</h3></div>
      {!list.length ? (
        <p className="hint">No odor alerts, all clear 🌿</p>
      ) : (
        <ul className="list">
          {list.map((b) => (
            <li key={b.id} className="clickable" onClick={() => onSelect(b.id)}>
              <span>⚠ {b.name}</span>
              <small>Avoid area · index {b.odor_index}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}