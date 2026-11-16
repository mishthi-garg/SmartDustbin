import { Trash2 } from 'lucide-react'
import StatusDot from './StatusDot'

export default function Sidebar({ items, active, onSelect, health }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Trash2 size={18} /></span>
        <div><b>SmartBin</b><small>CAMPUS SYNC</small></div>
      </div>

      <nav className="nav">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item ${active === key ? 'active' : ''}`}
            onClick={() => onSelect(key)}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      {health && (
        <div className="sys-status">
          <small>SYSTEM STATUS</small>
          <StatusDot color={health.ok ? '#22c55e' : '#eab308'} />
          {health.text}
        </div>
      )}
    </aside>
  )
}