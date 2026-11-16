import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useBinData } from '../../hooks/useBinData'
import { fetchHourly } from '../../services/analyticsService'
import { THRESHOLDS as T } from '../../utils/thresholds'

function TrendChart({ title, data, dataKey, color, unit = '', refs = [] }) {
  return (
    <section className="panel">
      <div className="panel-head"><h3>{title}</h3></div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="t" tickLine={false} axisLine={false} minTickGap={48} />
          <YAxis tickLine={false} axisLine={false} unit={unit} />
          <Tooltip />
          {refs.map((r) => (
            <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeDasharray="4 4" />
          ))}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

export default function BinTrends() {
  const { bins } = useBinData()
  const [binId, setBinId] = useState('')
  const [days, setDays] = useState(7)
  const [data, setData] = useState([])

  const current = binId || bins[0]?.id

  useEffect(() => {
    if (!current) return
    let alive = true
    fetchHourly(current, days).then((rows) => {
      if (!alive) return
      setData(rows.map((r) => ({
        ...r,
        t: new Date(r.hour).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit' }),
      })))
    })
    return () => { alive = false }
  }, [current, days])

  return (
    <>
      <div className="panel-row">
        <h1 className="page-title">Bin trends</h1>
        <div className="controls">
          <select value={current ?? ''} onChange={(e) => setBinId(e.target.value)}>
            {bins.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="seg">
            {[[1, '24h'], [7, '7d'], [30, '30d']].map(([d, l]) => (
              <button key={d} className={days === d ? 'on' : ''} onClick={() => setDays(d)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="trend-grid">
        <TrendChart title="Fill level" data={data} dataKey="avg_fill" color="#7c3aed" unit="%"
          refs={[{ y: T.fill.warn, color: '#eab308' }, { y: T.fill.crit, color: '#ef4444' }]} />
        <TrendChart title="Odor spikes (hourly peak)" data={data} dataKey="max_odor" color="#f59e0b"
          refs={[{ y: T.odor.crit, color: '#ef4444' }]} />
        <TrendChart title="Temperature (hourly peak)" data={data} dataKey="max_temp" color="#ef4444" unit="°C"
          refs={[{ y: T.temp.crit, color: '#ef4444' }]} />
      </div>
    </>
  )
}