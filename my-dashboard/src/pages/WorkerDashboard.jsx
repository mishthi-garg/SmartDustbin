import { useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { useBinAssignments } from '../hooks/useBinAssignments'
import { workerState } from '../utils/colorCode'
import Navbar from '../components/common/Navbar'
import AlertBadge from '../components/common/AlertBadge'
import BinList from '../components/worker/BinList'
import BinDetails from '../components/worker/BinDetails'
import AlertFeed from '../components/worker/AlertFeed'
import CollectionHistory from '../components/worker/CollectionHistory'
import ReportForm from '../components/public/ReportForm'
import { Map as MapIcon, LayoutDashboard } from 'lucide-react'
import Sidebar from '../components/common/Sidebar'

import { useWorkers } from '../hooks/useWorkers'
import { resolveAlert, enableNotifications, acknowledgeAlert } from '../services/alertService'  // add acknowledgeAlert

const NAV = [
  { key: 'map', label: 'Campus map', icon: MapIcon, to: '/', end: true },
  { key: 'supervisor', label: 'Supervisor dashboard', icon: LayoutDashboard, to: '/worker' },
]

export default function WorkerDashboard() {
  const { bins, loading, refresh } = useBinData()
  const { alerts, refresh: refreshAlerts } = useAlerts()
  const { assignments, refresh: refreshAssignments } = useBinAssignments()
  const [tab, setTab] = useState('bins')
  const [historyKey, setHistoryKey] = useState(0)
  const [reportBin, setReportBin] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [perm, setPerm] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )
  const { workers } = useWorkers({ onlyActive: true })

  if (loading) return <p className="hint">Loading…</p>

  const states = bins.map((b) => workerState(b, assignments[b.id]))
  // still needs work: emergency, full, or someone is mid-pickup
  const pending = states.filter((b) => ['emergency', 'full', 'collecting'].includes(b.state)).length
  const detailBin = states.find((b) => b.id === detailId)
  const urgent = alerts.some((a) => a.severity >= 3)

  const onChanged = () => {
    refresh()
    refreshAlerts()
    refreshAssignments()
    setHistoryKey((k) => k + 1)
  }
  const onResolve = async (id) => {
    await resolveAlert(id)
    refreshAlerts()
  }
  
const onAck = async (id, workerId) => {
  const res = await acknowledgeAlert(id, workerId)
  if (!res.ok) return window.alert(res.error)
  refreshAlerts()
}

  return (
  <div className="shell">
    <Sidebar items={NAV} />

    <div className="main">
      <Navbar title="Supervisor Dashboard" />

      {perm === 'default' && (
        <button className="enable-alerts" onClick={async () => setPerm(await enableNotifications())}>
          🔔 Enable phone alerts
        </button>
      )}

      <section className="overview-strip">
  <div className="ov-title">
    <small>CAMPUS OPERATIONS</small>
    <h3>Sanitation overview</h3>
  </div>
  <div className="ov-stat"><span>Total bins</span><b>{bins.length}</b></div>
  <div className="ov-stat"><span>Pending collections</span><b>{pending}</b></div>
  <div className="ov-stat"><span>Active alerts</span><b>{alerts.length}</b></div>
</section>

      <nav className="tabs">
        <button className={tab === 'bins' ? 'on' : ''} onClick={() => setTab('bins')}>All Bins</button>
        <button className={tab === 'alerts' ? 'on' : ''} onClick={() => setTab('alerts')}>
          Active Alerts <AlertBadge count={alerts.length} urgent={urgent} />
        </button>
        <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>
          Collection History
        </button>
      </nav>

      {tab === 'bins' && (
        <BinList bins={bins} assignments={assignments} onChanged={onChanged}
          onReport={setReportBin} onDetails={setDetailId} />
      )}
      {tab === 'alerts' && <AlertFeed alerts={alerts} bins={bins} workers={workers} onResolve={onResolve} onAck={onAck} />}
      {tab === 'history' && <CollectionHistory refreshKey={historyKey} />}
    </div>

    {reportBin && (
      <div className="overlay">
        <ReportForm bins={bins} defaultBinId={reportBin} onClose={() => setReportBin(null)} />
      </div>
    )}
    {detailBin && (
      <div className="overlay">
        <BinDetails bin={detailBin} alerts={alerts} onClose={() => setDetailId(null)} />
      </div>
    )}
  </div>
)
}