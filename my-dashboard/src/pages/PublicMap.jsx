import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBinData } from '../hooks/useBinData'
import BinMap from '../components/public/BinMap'
import BinStatusCard from '../components/public/BinStatusCard'
import StatusDot from '../components/common/StatusDot'
import ReportForm from '../components/public/ReportForm'

export default function PublicMap() {
  const { bins, loading, live } = useBinData()
  const [selectedId, setSelectedId] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const selected = bins.find((b) => b.id === selectedId)

  if (loading) return <p className="hint">Loading bins…</p>

  return (
    <div className="public-page">
      <header className="topbar">
        <h2>Campus Bins</h2>
        <span className="live">
          <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
          {live ? 'LIVE' : 'DEMO'}
        </span>
        <button className="report-btn" onClick={() => setShowReport(true)}>Report issue</button>
        <Link to="/login" className="report-btn">Staff login</Link>
      </header>
      <BinMap bins={bins} selectedId={selectedId} onSelect={setSelectedId} />
      <BinStatusCard bin={selected} />
      {/* Report Form Overlay */}
    {showReport && (
      <div className="overlay">
        <ReportForm
          bins={bins}
          defaultBinId={selectedId}
          onClose={() => setShowReport(false)}
        />
      </div>
    )}
    </div>
  )
}