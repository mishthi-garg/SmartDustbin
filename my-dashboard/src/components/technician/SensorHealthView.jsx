import { useEffect, useState } from 'react'
import { useBinData } from '../../hooks/useBinData'
import { useSensorHistory } from '../../hooks/useSensorHistory'
import { fetchHourly, fetchBaseline } from '../../services/analyticsService'
import {
  SENSORS, analyseSensor, evaluateDevice, healthScore, healthLevel, batteryLevel,
  deliveryBuckets, driftPct,
} from '../../utils/sensorHealth'
import BinMap from '../public/BinMap'
import AlertFeed from '../worker/AlertFeed'
import DeviceHealth from './DeviceHealth'
import SensorHealthPanel from './SensorHealthPanel'
import SensorGauge from './SensorGauge'
import RealTimeChart from './RealTimeChart'

// `alerts` comes from the parent: calling useAlerts here too would open a duplicate realtime channel
export default function SensorHealthView({ alerts }) {
  const { bins, loading } = useBinData()
  const [kind, setKind] = useState('dry')
  const [binId, setBinId] = useState(null)
  const [hourly, setHourly] = useState([])
  const [baseline, setBaseline] = useState([])

  const selectedBin = bins.find((b) => b.id === binId)
    ?? bins.find((b) => (b.kind ?? 'dry') === 'dry')
    ?? bins[0]
  const kindBins = bins.filter((b) => (b.kind ?? 'dry') === kind)
  const bin = kindBins.find((b) => b.id === selectedBin?.id) ?? kindBins[0] ?? selectedBin
  const history = useSensorHistory(bin?.id)

  useEffect(() => {
    if (!bin?.id) return
    let alive = true
    fetchHourly(bin.id, 3).then((r) => alive && setHourly(r))
    fetchBaseline(bin.id).then((r) => alive && setBaseline(r))
    return () => { alive = false }
  }, [bin?.id])

  if (loading) return <p className="hint">Loading…</p>

  const pickBin = (id) => {
    const b = bins.find((x) => x.id === id)
    if (!b) return
    setKind(b.kind ?? 'dry')
    setBinId(id)
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
    <>
      <div className="panel-row">
        <div>
          <h1 className="page-title">Sensor health</h1>
          <p className="panel-sub">{bin ? `${bin.name} · ${kind} bin stats` : 'No bin selected'}</p>
        </div>
      </div>
      <div className="controls sensor-health-controls">
        <select value={selectedBin?.id ?? ''} onChange={(e) => pickBin(e.target.value)}>
          {bins.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="seg">
          {[['dry', 'Dry bin'], ['wet', 'Wet bin']].map(([k, l]) => (
            <button key={k} className={kind === k ? 'on' : ''}
              onClick={() => setKind(k)}>{l}</button>
          ))}
        </div>
      </div>

      {deviceAlerts.length > 0 && (
        <section className="panel">
          <div className="panel-head"><small>NEEDS A VISIT</small><h3>Device alerts</h3></div>
          <AlertFeed alerts={deviceAlerts} bins={bins} />
        </section>
      )}

      <section className="panel map-compact">
        <BinMap bins={bins} selected={selectedBin} />
      </section>

      {!kindBins.length ? (
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
    </>
  )
}