import { NavLink } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import StatusDot from './StatusDot'

function Item({ item, active, onSelect }) {
  const { key, label, icon: Icon, to, end, badge, soon } = item
  const body = (
    <>
      <Icon size={17} />
      <span>{label}</span>
      {badge ? <em className="nav-badge">{badge}</em> : null}
      {soon ? <em className="nav-soon">soon</em> : null}
    </>
  )

  if (to) {
    return (
      <NavLink to={to} end={end}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {body}
      </NavLink>
    )
  }
  if (soon) return <span className="nav-item disabled">{body}</span>
  return (
    <button className={`nav-item ${active === key ? 'active' : ''}`} onClick={() => onSelect?.(key)}>
      {body}
    </button>
  )
}

export default function Sidebar({ items, groups, active, onSelect, health, brandSub = 'CAMPUS SYNC' }) {
  const sections = groups ?? [{ items }]

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Trash2 size={18} /></span>
        <div><b>SmartBin</b><small>{brandSub}</small></div>
      </div>

      <nav className="nav">
        {sections.map((g, i) => (
          <div className="nav-group" key={g.title ?? i}>
            {g.title && <small className="nav-title">{g.title}</small>}
            {g.items.map((it) => (
              <Item key={it.key} item={it} active={active} onSelect={onSelect} />
            ))}
          </div>
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