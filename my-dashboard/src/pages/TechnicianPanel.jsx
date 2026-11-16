import { useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { useSensorHistory } from '../hooks/useSensorHistory'
import { evaluateSensors, healthScore, healthLevel, batteryLevel } from '../utils/sensorHealth'
import Navbar from '../components/common/Navbar'
import StatusDot from '../components/common/StatusDot'
import BinMap from '../components/public/BinMap'
import AlertFeed from '../components/worker/AlertFeed'
import SensorHealthPanel from '../components/technician/SensorHealthPanel'
import SensorGauge from '../components/technician/SensorGauge'
import RealTimeChart from '../components/technician/RealTimeChart'

export default function TechnicianPanel() {
  const { bins, loading, live } = useBinData()
  const { alerts } = useAlerts()
  const [kind, setKind] = useState('dry')
  const [binId, setBinId] = useState(null)

  const kindBins = bins.filter((b) => (b.kind ?? 'dry') === kind)
  const bin = kindBins.find((b) => b.id === binId) ?? kindBins[0]
  const history = useSensorHistory(bin?.id)

  if (loading) return <p className="hint">Loading…</p>

  const sensors = bin ? evaluateSensors(bin, history) : []
  const score = healthScore(sensors)
  const battery = bin?.battery_pct ?? null
  const deviceAlerts = alerts.filter((a) => a.type === 'offline' || a.type === 'battery')
  const chartRows = history.map((r) => ({
    ...r,
    t: new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }))

  return (
    <div className="worker-page">
      <Navbar title="Maintenance Technician">
        <span className="chip live">
          <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
          {live ? 'LIVE' : 'DEMO'}
        </span>
      </Navbar>

      <div className="panel-row">
        <div>
          <h1 className="page-title">Hardware analytics</h1>
          <p className="panel-sub">{bin ? bin.name : 'No bin selected'}</p>
        </div>
        <div className="controls">
          <select value={bin?.id ?? ''} onChange={(e) => setBinId(e.target.value)}>
            {kindBins.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="seg">
            {[['dry', 'Dry bin'], ['wet', 'Wet bin']].map(([k, l]) => (
              <button key={k} className={kind === k ? 'on' : ''}
                onClick={() => { setKind(k); setBinId(null) }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {deviceAlerts.length > 0 && (
        <section className="panel">
          <div className="panel-head"><small>NEEDS A VISIT</small><h3>Device alerts</h3></div>
          <AlertFeed alerts={deviceAlerts} bins={bins} />
        </section>
      )}

      <section className="panel map-compact">
        <BinMap bins={kindBins} selected={bin} onSelect={setBinId} />
      </section>

      {!bin ? (
        <p className="hint">No {kind} bins registered yet</p>
      ) : (
        <>
          <SensorHealthPanel sensors={sensors} binName={bin.name} />

          <div className="two-col">
            <SensorGauge title="Overall health" value={score} level={healthLevel(score)}
              sub="sensors working" scale={['OFFLINE', 'WARNING', 'ONLINE']} />
            <SensorGauge title="Battery" value={battery} level={batteryLevel(battery)}
              sub={battery == null ? 'no battery data' : 'ESP32 power'} scale={['LOW', 'MEDIUM', 'FULL']} />
          </div>

          <div className="rt-grid">
            <RealTimeChart title="Fill level" data={chartRows} dataKey="fill_pct"
              color="#2563eb" unit="%" current={bin.fill_pct} />
            <RealTimeChart title="Odor" data={chartRows} dataKey="odor_index"
              color="#f59e0b" current={bin.odor_index} />
            <RealTimeChart title="Temperature" data={chartRows} dataKey="temp_c"
              color="#ef4444" unit="°C" current={bin.temp_c} />
          </div>
        </>
      )}
    </div>
  )
}