import { useEffect, useState } from 'react'
import { fetchProblemStats } from '../../services/analyticsService'

function RankCard({ title, hint, rows, field, fmt = (v) => v }) {
  const top = [...rows].filter((r) => r[field] > 0).sort((a, b) => b[field] - a[field]).slice(0, 5)
  const max = Math.max(1, ...top.map((r) => r[field]))

  return (
    <section className="panel">
      <div className="panel-head"><small>{hint}</small><h3>{title}</h3></div>
      {!top.length ? (
        <p className="hint">None in the last 30 days</p>
      ) : (
        <ul className="rank">
          {top.map((r, i) => (
            <li key={r.bin_id}>
              <span className="rank-n">{i + 1}</span>
              <div className="rank-body">
                <div className="rank-row"><b>{r.name}</b><span>{fmt(r[field])}</span></div>
                <div className="bar accent"><i style={{ width: `${(r[field] / max) * 100}%` }} /></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function ProblematicBins() {
  const [rows, setRows] = useState([])
  useEffect(() => { fetchProblemStats().then(setRows) }, [])

  return (
    <>
      <h1 className="page-title">Problematic bins</h1>
      <p className="panel-sub">Last 30 days · use this to decide where extra pickups or maintenance go</p>

      <div className="rank-grid">
        <RankCard title="Most alerts" hint="TRIGGERED" rows={rows} field="alerts_30d" />
        <RankCard title="Fills fastest" hint="MEASURED RATE" rows={rows} field="fill_per_hour"
          fmt={(v) => `+${v.toFixed(1)}% / hr`} />
        <RankCard title="Most animal activity" hint="DETECTIONS" rows={rows} field="animal_30d" />

        <section className="panel">
          <div className="panel-head"><small>NOT TRACKED YET</small><h3>Sensor offline most often</h3></div>
          <p className="hint">
            Offline is currently derived live from reading age, so nothing is stored to rank.
            This needs an offline-event log, which comes with the Sensor Health page.
          </p>
        </section>
      </div>
    </>
  )
}