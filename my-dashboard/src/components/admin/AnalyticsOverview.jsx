import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useBinData } from '../../hooks/useBinData'
import { fetchCollections } from '../../services/analyticsService'
import { levelOf, withStatus } from '../../utils/colorCode'
import { THRESHOLDS as T } from '../../utils/thresholds'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'
import Gauge from '../common/Gauge'

const PALETTE = ['#7c3aed', '#a78bfa', '#c4b5fd', '#60a5fa', '#93c5fd', '#34d399', '#fbbf24', '#f87171', '#94a3b8', '#475569']
const GAUGE_COLOR = { normal: 'var(--accent)', warning: 'var(--warn)', critical: 'var(--bad)' }
const LEVEL = { normal: 'normal', warning: 'warning', critical: 'critical', emergency: 'critical' }
const LABEL = { normal: 'Normal', warning: 'Attention', critical: 'Critical', emergency: 'Emergency' }
const isCritical = (b) => b.status === 'critical' || b.status === 'emergency'

// bucket collections: 'week' = last 7 days (per day), 'month' = last 8 weeks (per week)
function buildSeries(rows, bins, mode) {
  const n = mode === 'week' ? 7 : 8
  const span = mode === 'week' ? 86400000 : 7 * 86400000
  const now = Date.now()
  const nameOf = Object.fromEntries(bins.map((b) => [b.id, b.name]))

  const buckets = Array.from({ length: n }, (_, i) => ({
    label: mode === 'week'
      ? new Date(now - (n - 1 - i) * span).toLocaleDateString('en-IN', { weekday: 'short' })
      : i === n - 1 ? 'This wk' : `${n - 1 - i}w ago`,
    ...Object.fromEntries(bins.map((b) => [b.name, 0])),
  }))

  rows.forEach((r) => {
    const idx = n - 1 - Math.floor((now - new Date(r.collected_at).getTime()) / span)
    const name = nameOf[r.bin_id]
    if (idx >= 0 && idx < n && name) buckets[idx][name] += 1
  })
  return buckets
}

export default function AnalyticsOverview() {
  const { bins } = useBinData()
  const { alerts } = useOutletContext()
  const [rows, setRows] = useState([])
  const [mode, setMode] = useState('week')
  const [tab, setTab] = useState('all')

  useEffect(() => { fetchCollections().then(setRows) }, [])

  const list = bins.map(withStatus)
  const fills = list.map((b) => b.fill_pct).filter((v) => v != null)
  const avgFill = fills.length ? Math.round(fills.reduce((s, v) => s + v, 0) / fills.length) : 0
  const needPickup = list.filter(isCritical).length
  const series = useMemo(() => buildSeries(rows, bins, mode), [rows, bins, mode])
  const shown = list.filter((b) => tab === 'all' || (tab === 'critical' ? isCritical(b) : !isCritical(b)))
  const gaugeLv = levelOf(avgFill, T.fill.warn, T.fill.crit)

  return (
    <>
      <h1 className="page-title">Bin analytics</h1>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-head"><h3>Campus fill level</h3></div>
          <p className="panel-sub">Average across all {bins.length} bins</p>
          <Gauge value={avgFill} label={`${avgFill}%`} sub="average fill" color={GAUGE_COLOR[gaugeLv]} />
          <p className="gauge-foot"><b>{needPickup}</b> bin{needPickup === 1 ? '' : 's'} need pickup now</p>
          <span className="pill accent">{alerts.length} open alert{alerts.length === 1 ? '' : 's'}</span>
        </section>

        <section className="panel">
          <div className="panel-row">
            <div>
              <div className="panel-head"><h3>Collections per bin</h3></div>
              <p className="panel-sub">Hover a bar to see the split by bin</p>
            </div>
            <div className="seg">
              <button className={mode === 'week' ? 'on' : ''} onClick={() => setMode('week')}>Week</button>
              <button className={mode === 'month' ? 'on' : ''} onClick={() => setMode('month')}>Month</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(124,58,237,.06)' }} />
              {bins.map((b, i) => (
                <Bar key={b.id} dataKey={b.name} stackId="c" fill={PALETTE[i % PALETTE.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="panel">
        <div className="panel-row">
          <h3>Live bins <span className="count-chip">{bins.length}</span></h3>
          <div className="seg">
            {[['all', 'All Bins'], ['critical', 'Critical'], ['normal', 'Normal']].map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="table-wrap flat">
          <table className="bin-table">
            <thead>
              <tr><th>Bin</th><th>Status</th><th>Fill</th><th>Odor</th><th>Temp</th><th>Last collected</th><th>Open alerts</th></tr>
            </thead>
            <tbody>
              {shown.map((b) => (
                <tr key={b.id}>
                  <td><b>{b.name}</b></td>
                  <td><span className={`pill ${LEVEL[b.status]}`}>{LABEL[b.status]}</span></td>
                  <td>
                    <div className="fill-cell">
                      <div className={`bar ${levelOf(b.fill_pct, T.fill.warn, T.fill.crit)}`}>
                        <i style={{ width: `${b.fill_pct ?? 0}%` }} />
                      </div>
                      <span>{fmtPct(b.fill_pct)}</span>
                    </div>
                  </td>
                  <td>{b.odor_index ?? '--'}</td>
                  <td>{fmtTemp(b.temp_c)}</td>
                  <td>{timeAgo(b.last_collected_at)}</td>
                  <td>{alerts.filter((a) => a.bin_id === b.id && !a.derived).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shown.length && <p className="hint">Nothing here 🎉</p>}
        </div>
      </section>
    </>
  )
}