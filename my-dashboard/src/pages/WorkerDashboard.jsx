import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Map } from 'lucide-react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { statusRank, withStatus, STATUS_COLORS } from '../utils/colorCode'
import { sensorHealth } from '../utils/formatData'
import { resolveAlert, enableNotifications } from '../services/alertService'
import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar.jsx'
import AlertBadge from '../components/common/AlertBadge'
import StatusDot from '../components/common/StatusDot'
import BinList from '../components/worker/BinList'
import AlertFeed from '../components/worker/AlertFeed'
import CollectionHistory from '../components/worker/CollectionHistory'
import ReportForm from '../components/public/ReportForm'

const NAV = [
  { key: 'map', label: 'Campus map', icon: Map },
  { key: 'worker', label: 'Worker dashboard', icon: LayoutDashboard },
]

const LABEL = {
  emergency: 'Emergency',
  critical: 'Needs pickup',
  warning: 'Attention',
  normal: 'OK',
}

export default function WorkerDashboard() {
  const { bins, loading, refresh } = useBinData()
  const { alerts, refresh: refreshAlerts } = useAlerts()
  const navigate = useNavigate()
  const [tab, setTab] = useState('bins')
  const [selectedBinId, setSelectedBinId] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [reportBin, setReportBin] = useState(null)
  const [perm, setPerm] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )

  if (loading) return <p className="hint">Loading…</p>

  const indexedBins = bins
    .map(withStatus)
    .sort(
      (a, b) =>
        statusRank(b.status) - statusRank(a.status) ||
        (b.fill_pct ?? 0) - (a.fill_pct ?? 0)
    )
  const selectedBin = bins.find((bin) => bin.id === selectedBinId)
  const pending = indexedBins.filter((b) => b.status === 'critical' || b.status === 'emergency').length
  const health = sensorHealth(bins)
  const visibleBins = selectedBin ? bins.filter((bin) => bin.id === selectedBinId) : bins
  const visibleAlerts = selectedBin
    ? alerts.filter((alert) => alert.bin_id === selectedBinId)
    : alerts
  const urgent = visibleAlerts.some((a) => a.severity >= 3)

  const onChanged = () => {
    refresh()
    refreshAlerts()
    setHistoryKey((k) => k + 1)
  }
  const onResolve = async (id) => {
    await resolveAlert(id)
    refreshAlerts()
  }
  const onNavigate = (key) => {
    if (key === 'map') navigate('/')
    else setTab('bins')
  }

  return (
    <div className="shell">
      <Sidebar
        items={NAV}
        active="worker"
        onSelect={onNavigate}
        health={{
          ok: health.ok,
          text: health.ok
            ? 'All sensors online'
            : `${health.offline} of ${health.total} sensors offline`,
        }}
      />

      <main className="main worker-main">
        <div className="worker-page">
          <Navbar title="Worker Dashboard">
            {perm === 'default' && (
              <button
                className="enable-alerts"
                onClick={async () => setPerm(await enableNotifications())}
              >
                Enable phone alerts
              </button>
            )}
          </Navbar>

          <section className="worker-overview" aria-label="Collection overview">
            <div className="worker-overview-title">
              <small>CAMPUS OPERATIONS</small>
              <h2>Sanitation overview</h2>
            </div>
            <div className="worker-overview-metrics">
              <div><small>Total bins</small><b>{bins.length}</b></div>
              <div><small>Pending collections</small><b>{pending}</b></div>
              <div><small>Active alerts</small><b>{alerts.length}</b></div>
            </div>
          </section>

          <nav className="tabs" aria-label="Worker dashboard sections">
            <button className={tab === 'bins' ? 'on' : ''} onClick={() => setTab('bins')}>All Bins</button>
            <button className={tab === 'alerts' ? 'on' : ''} onClick={() => setTab('alerts')}>
              Active Alerts <AlertBadge count={alerts.length} urgent={urgent} />
            </button>
            <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>
              Collection History
            </button>
          </nav>

          <div className="worker-workspace">
            <aside className="worker-bin-index">
              <div className="worker-index-heading">
                <small>BIN DIRECTORY</small>
                <h3>Bins index</h3>
              </div>
              <nav className="worker-bin-list" aria-label="Filter by bin">
                <button
                  className={`worker-bin-item ${selectedBinId === null ? 'is-selected' : ''}`}
                  onClick={() => setSelectedBinId(null)}
                  aria-pressed={selectedBinId === null}
                >
                  <span className="worker-bin-name">All bins</span>
                  <span className="worker-bin-count">{bins.length}</span>
                </button>
                {indexedBins.map((bin) => (
                  <button
                    key={bin.id}
                    className={`worker-bin-item ${selectedBinId === bin.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedBinId(bin.id)}
                    aria-pressed={selectedBinId === bin.id}
                  >
                    <span className="worker-bin-name">
                      <StatusDot color={STATUS_COLORS[bin.status]} pulse={bin.status === 'emergency'} />
                      {bin.name}
                    </span>
                    <small>{bin.done ? 'Collected' : LABEL[bin.status]}</small>
                  </button>
                ))}
              </nav>
            </aside>

            <section className="worker-content">
              <div className="worker-content-heading">
                <div>
                  <small>
                    {tab === 'bins'
                      ? 'COLLECTION MANAGEMENT'
                      : tab === 'alerts'
                        ? 'ATTENTION REQUIRED'
                        : 'COMPLETED COLLECTIONS'}
                  </small>
                  <h3>
                    {tab === 'bins'
                      ? 'Bin inventory'
                      : tab === 'alerts'
                        ? 'Active alerts'
                        : 'Collection history'}
                  </h3>
                </div>
                {selectedBin && (
                  <button className="report-btn" onClick={() => setSelectedBinId(null)}>
                    Clear bin filter
                  </button>
                )}
              </div>

              {tab === 'bins' && (
                <BinList bins={visibleBins} onChanged={onChanged} onReport={setReportBin} />
              )}
              {tab === 'alerts' && (
                <AlertFeed alerts={visibleAlerts} bins={bins} onResolve={onResolve} />
              )}
              {tab === 'history' && (
                <CollectionHistory refreshKey={historyKey} binId={selectedBinId} />
              )}
            </section>
          </div>
        </div>
      </main>

      {reportBin && (
        <div className="overlay">
          <ReportForm bins={bins} defaultBinId={reportBin} onClose={() => setReportBin(null)} />
        </div>
      )}
    </div>
  )
}