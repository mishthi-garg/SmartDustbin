import { useState } from 'react'
import { useBinData } from '../hooks/useBinData'
import { sensorHealth, fmtTemp } from '../utils/formatData'
import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar'
import StatusDot from '../components/common/StatusDot'
import BinMap from '../components/public/BinMap'
import BinStatusCard from '../components/public/BinStatusCard'
import NearbyBins from '../components/public/NearbyBins'
import OdorAdvisories from '../components/public/OdorAdvisories'
import ReportForm from '../components/public/ReportForm'
import { Map as MapIcon, MapPin, Wind, Flag, Thermometer, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME, ROLE_DASHBOARD } from '../utils/roles'

const NAV = [
  { key: 'map', label: 'Live Map', icon: MapIcon },
  { key: 'nearby', label: 'Nearby Bins', icon: MapPin },
  { key: 'advisories', label: 'Odor Advisories', icon: Wind },
  { key: 'report', label: 'Report Issue', icon: Flag },
]

export default function PublicMap() {
  const { bins, loading, live } = useBinData()
  const [selectedId, setSelectedId] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [active, setActive] = useState('map')

  const { user } = useAuth()

  if (loading) return <p className="hint">Loading bins…</p>

  const selected = bins.find((b) => b.id === selectedId)
  const h = sensorHealth(bins)
  const health = {
    ok: h.ok,
    text: h.ok ? 'All sensors online' : `${h.offline} of ${h.total} sensors offline`,
  }
  const temps = bins.map((b) => b.temp_c).filter((t) => t != null)
  const avgTemp = temps.length ? temps.reduce((s, t) => s + t, 0) / temps.length : null

  const nav = user
  ? [{ key: 'home', label: ROLE_DASHBOARD[user.role], icon: LayoutDashboard, to: ROLE_HOME[user.role] }, ...NAV]
  : NAV

  const goTo = (key) => {
    if (key === 'report') return setShowReport(true)
    setActive(key)
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' })
  }

  const pickBin = (id) => {
    setSelectedId(id)
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })
  }

  const onSearch = (text) => {
    const q = text.trim().toLowerCase()
    if (!q) return
    const hits = bins.filter((b) => b.name.toLowerCase().includes(q))
    if (hits.length === 1) setSelectedId(hits[0].id)
  }

  return (
    <div className="shell">
     <Sidebar items={nav} active={active} onSelect={goTo} health={health} />
      <div className="main">
        <Navbar onSearch={onSearch} searchOptions={bins.map((b) => b.name)}>
          <span className="chip" title="Average bin temperature">
            <Thermometer size={14} /> {fmtTemp(avgTemp)}
          </span>
          <span className="chip live">
            <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
            {live ? 'LIVE' : 'DEMO'}
          </span>
        </Navbar>

        <section id="map" className="panel map-panel">
          <div className="panel-head">
            <small>LIVE CAMPUS PULSE</small>
            <h3>Campus Bin Grid</h3>
          </div>
          <BinMap bins={bins} selected={selected} onSelect={setSelectedId} />
        </section>

        <BinStatusCard bins={bins} bin={selected} />

        <div className="two-col">
          <NearbyBins bins={bins} onSelect={pickBin} />
          <OdorAdvisories bins={bins} onSelect={pickBin} />
        </div>
      </div>

      {showReport && (
        <div className="overlay">
          <ReportForm bins={bins} defaultBinId={selectedId} onClose={() => setShowReport(false)} />
        </div>
      )}
    </div>
  )
}