import { useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import BinMap from '../components/public/BinMap'
import BinStatusCard from '../components/public/BinStatusCard'
import StatusDot from '../components/common/StatusDot'

export default function PublicMap() {
  const { bins, loading, live } = useBinData()
  const [selectedId, setSelectedId] = useState(null)
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
      </header>
      <BinMap bins={bins} selectedId={selectedId} onSelect={setSelectedId} />
      <BinStatusCard bin={selected} />
    </div>
  )
}