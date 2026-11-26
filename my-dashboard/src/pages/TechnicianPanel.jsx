import { Map as MapIcon, Wrench } from 'lucide-react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { sensorHealth } from '../utils/formatData'
import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar'
import StatusDot from '../components/common/StatusDot'
import SensorHealthView from '../components/technician/SensorHealthView'

const NAV = [
  { key: 'map', label: 'Campus map', icon: MapIcon, to: '/', end: true },
  { key: 'tech', label: 'Technician panel', icon: Wrench, to: '/tech' },
]

export default function TechnicianPanel() {
  const { bins, live } = useBinData()
  const { alerts } = useAlerts()

  const h = sensorHealth(bins)
  const health = {
    ok: h.ok,
    text: h.ok ? 'All sensors online' : `${h.offline} of ${h.total} sensors offline`,
  }

  return (
    <div className="shell">
      <Sidebar items={NAV} health={health} />
      <div className="main">
        <Navbar title="Maintenance Technician">
          <span className="chip live">
            <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
            {live ? 'LIVE' : 'DEMO'}
          </span>
        </Navbar>
        <SensorHealthView alerts={alerts} />
      </div>
    </div>
  )
}