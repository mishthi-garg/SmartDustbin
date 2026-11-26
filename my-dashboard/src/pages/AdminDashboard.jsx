import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Map as MapIcon, TrendingUp, Bell, AlertTriangle, Activity,
  Users, ClipboardList, SlidersHorizontal, UserCog, Megaphone, Thermometer, FileText, Link2, BarChart3
} from 'lucide-react'
import { useBinData } from '../hooks/useBinData'
import { useAlerts } from '../hooks/useAlerts'
import { sensorHealth, fmtTemp } from '../utils/formatData'
import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar'
import StatusDot from '../components/common/StatusDot'

const GROUPS = [
  { title: 'General', items: [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard, to: '/admin', end: true },
    { key: 'map', label: 'Live Bin Map', icon: MapIcon, to: '/' },
  ]},
  { title: 'Analytics', items: [
  { key: 'trends', label: 'Bin Trends', icon: TrendingUp, to: '/admin/trends' },
  { key: 'alerts', label: 'Alert History', icon: Bell, to: '/admin/alerts' },
  { key: 'problem', label: 'Problematic Bins', icon: AlertTriangle, to: '/admin/problematic' },
  // Analytics group: add Reports, and make Sensor Health live
{ key: 'sensors', label: 'Sensor Health', icon: Activity, to: '/admin/sensors' },
{ key: 'reports', label: 'Reports', icon: FileText, to: '/admin/reports' },
]},
{ title: 'Workers', items: [
  { key: 'workers', label: 'Worker List', icon: Users, to: '/admin/workers' },
  { key: 'assign', label: 'Bin Assignments', icon: Link2, to: '/admin/assignments' },
  { key: 'perf', label: 'Performance', icon: BarChart3, to: '/admin/performance' },
  { key: 'logs', label: 'Collection Logs', icon: ClipboardList, to: '/admin/logs' },
]},
  { title: 'Settings', items: [
    // Settings group: make Alert Thresholds live (User Management and Notifications keep `soon: true`)
{ key: 'thresholds', label: 'Alert Thresholds', icon: SlidersHorizontal, to: '/admin/thresholds' },
    { key: 'users', label: 'User Management', icon: UserCog, soon: true },
    { key: 'notify', label: 'Notifications', icon: Megaphone, soon: true },
  ]},
]

export default function AdminDashboard() {
  const { bins, loading, live } = useBinData()
  const { alerts } = useAlerts()          // single instance, shared with pages via Outlet context

  if (loading) return <p className="hint">Loading…</p>

  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.map((i) => (i.key === 'alerts' ? { ...i, badge: alerts.length || null } : i)),
  }))

  const h = sensorHealth(bins)
  const health = {
    ok: h.ok,
    text: h.ok ? 'All sensors online' : `${h.offline} of ${h.total} sensors offline`,
  }
  const temps = bins.map((b) => b.temp_c).filter((t) => t != null)
  const avgTemp = temps.length ? temps.reduce((s, t) => s + t, 0) / temps.length : null

  return (
    <div className="shell admin">
      <Sidebar groups={groups} health={health} brandSub="ADMIN" />
      <div className="main">
        <Navbar title="Department Admin">
          <span className="chip" title="Average bin temperature">
            <Thermometer size={14} /> {fmtTemp(avgTemp)}
          </span>
          <span className="chip live">
            <StatusDot color={live ? '#22c55e' : '#94a3b8'} pulse={live} />
            {live ? 'LIVE' : 'DEMO'}
          </span>
        </Navbar>
        <Outlet context={{ alerts }} />
      </div>
    </div>
  )
}