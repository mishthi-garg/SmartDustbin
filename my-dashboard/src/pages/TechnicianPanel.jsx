import { useEffect, useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { useSensorHistory } from '../hooks/useSensorHistory'
import { fetchHourly, fetchBaseline } from '../services/analyticsService'
import {
  SENSORS, analyseSensor, evaluateDevice, healthScore, healthLevel, batteryLevel,
  deliveryBuckets, driftPct,
} from '../utils/sensorHealth'
import Navbar from '../components/common/Navbar'
import StatusDot from '../components/common/StatusDot'
import BinMap from '../components/public/BinMap'
import AlertFeed from '../components/worker/AlertFeed'
import DeviceHealth from '../components/technician/DeviceHealth'
import SensorHealthPanel from '../components/technician/SensorHealthPanel'
import SensorGauge from '../components/technician/SensorGauge'
import RealTimeChart from '../components/technician/RealTimeChart'

import { Map as MapIcon, Wrench } from 'lucide-react'
import Sidebar from '../components/common/Sidebar'
import { sensorHealth } from '../utils/formatData'

const NAV = [
  { key: 'map', label: 'Campus map', icon: MapIcon, to: '/', end: true },
  { key: 'tech', label: 'Technician panel', icon: Wrench, to: '/tech' },
]

export default function TechnicianPanel() {
  const { bins, loading, live } = useBinData()
  const { alerts } = useAlerts()
  const [kind, setKind] = useState('dry')
  const [binId, setBinId] = useState(null)
  const [hourly, setHourly] = useState([])
  const [baseline, setBaseline] = useState([])

  const kindBins = bins.filter((b) => (b.kind ?? 'dry') === kind)
  const bin = kindBins.find((b) => b.id === binId) ?? kindBins[0]
  const history = useSensorHistory(bin?.id)

  useEffect(() => {
    if (!bin?.id) return
    let alive = true
    fetchHourly(bin.id, 3).then((r) => alive && setHourly(r))
    fetchBaseline(bin.id).then((r) => alive && setBaseline(r))
    return () => { alive = false }
  }, [bin?.id])

  if (loading) return <p className="hint">Loading…</p>

  const h = sensorHealth(bins)
const sidebarHealth = {
  ok: h.ok,
  text: h.ok ? 'All sensors online' : `${h.offline} of ${h.total} sensors offline`,
}

  const device = bin ? evaluateDevice(bin, history, hourly) : null
  const drift = driftPct(baseline)
  const sensors = bin
    ? SENSORS.map((s) => analyseSensor(s, history, { stale: device.stale, driftPct: drift }))
    : []
  const score = bin ? healthScore([...device.metrics, ...sensors]) : 0
  const m = device ? Object.fromEntries(device.metrics.map((x) => [x.key, x])) : {}
  const battery = bin?.battery_pct ?? null

  const deviceAlerts = alerts.filter((a) => a.type === 'offline' || a.type === 'battery')
  const timeLabel = (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const rssiRows = history.map((r) => ({ ...r, t: timeLabel(r.created_at) }))
  const batteryRows = hourly.map((r) => ({
    ...r,
    t: new Date(r.hour).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit' }),
  }))

 return (
  <div className="shell">
    <Sidebar items={NAV} health={sidebarHealth} />

    <div className="main">
    <Navbar title="Maintenance Technician">
        <span className="chip live">
          <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
          {live ? 'LIVE' : 'DEMO'}
        </span>
      </Navbar>

      <div className="panel-row">
        <div>
          <h1 className="page-title">Sensor health</h1>
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
          <div className="two-col">
            <SensorGauge title="Overall health" value={score} level={healthLevel(score)}
              sub="health checks passing" scale={['FAULT', 'CHECK', 'HEALTHY']} />
            <SensorGauge title="Battery" value={battery} level={batteryLevel(battery)}
              sub={battery == null ? 'no battery data' : m.battery.detail} scale={['LOW', 'MEDIUM', 'FULL']} />
          </div>

          <DeviceHealth metrics={device.metrics} binName={bin.name} />
          <SensorHealthPanel sensors={sensors} binName={bin.name} />

          <div className="rt-grid">
            <RealTimeChart title="Readings received" range="LAST 1 HOUR · PER 5 MIN"
              data={deliveryBuckets(history)} dataKey="received" color="#2563eb" current={m.delivery.value} />
            <RealTimeChart title="Wi-Fi signal" range="LAST 1 HOUR"
              data={rssiRows} dataKey="rssi" color="#0ea5e9" unit=" dBm" current={m.rssi.value.replace(' dBm', '')} />
            <RealTimeChart title="Battery" range="LAST 3 DAYS"
              data={batteryRows} dataKey="min_battery" color="#16a34a" current={m.battery.value} />
          </div>
        </>
            )}
    </div>
    </div>
  )
}