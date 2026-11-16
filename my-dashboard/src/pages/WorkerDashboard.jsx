import { useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { withStatus } from '../utils/colorCode'
import { resolveAlert, enableNotifications } from '../services/alertService'
import Navbar from '../components/common/Navbar.jsx'
import AlertBadge from '../components/common/AlertBadge'
import BinList from '../components/worker/BinList'
import AlertFeed from '../components/worker/AlertFeed'
import CollectionHistory from '../components/worker/CollectionHistory'
import ReportForm from '../components/public/ReportForm'

export default function WorkerDashboard() {
  const { bins, loading, refresh } = useBinData()
  const { alerts, refresh: refreshAlerts } = useAlerts()
  const [tab, setTab] = useState('bins')
  const [historyKey, setHistoryKey] = useState(0)
  const [reportBin, setReportBin] = useState(null)
  const [perm, setPerm] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )

  if (loading) return <p className="hint">Loading…</p>

  const pending = bins
    .map(withStatus)
    .filter((b) => b.status === 'critical' || b.status === 'emergency').length
  const urgent = alerts.some((a) => a.severity >= 3)

  const onChanged = () => {
    refresh()
    refreshAlerts()
    setHistoryKey((k) => k + 1)
  }
  const onResolve = async (id) => {
    await resolveAlert(id)
    refreshAlerts()
  }

  return (
    <div className="worker-page">
      <Navbar title="Worker Dashboard" />

      {perm === 'default' && (
        <button className="enable-alerts" onClick={async () => setPerm(await enableNotifications())}>
          🔔 Enable phone alerts
        </button>
      )}

      <div className="stat-row">
        <div className="card"><span>Bins</span><b>{bins.length}</b></div>
        <div className="card"><span>Pending collections</span><b>{pending}</b></div>
        <div className="card"><span>Alerts</span><b>{alerts.length}</b></div>
      </div>

      <nav className="tabs">
        <button className={tab === 'bins' ? 'on' : ''} onClick={() => setTab('bins')}>All Bins</button>
        <button className={tab === 'alerts' ? 'on' : ''} onClick={() => setTab('alerts')}>
          Active Alerts <AlertBadge count={alerts.length} urgent={urgent} />
        </button>
        <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>
          Collection History
        </button>
      </nav>

      {tab === 'bins' && <BinList bins={bins} onChanged={onChanged} onReport={setReportBin} />}
      {tab === 'alerts' && <AlertFeed alerts={alerts} bins={bins} onResolve={onResolve} />}
      {tab === 'history' && <CollectionHistory refreshKey={historyKey} />}

      {reportBin && (
        <div className="overlay">
          <ReportForm bins={bins} defaultBinId={reportBin} onClose={() => setReportBin(null)} />
        </div>
      )}
    </div>
  )
}