import { useAuth } from '../../hooks/useAuth'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="nav-user">
        <span>{user?.full_name} · {user?.role}</span>
        <button className="report-btn" onClick={logout}>Logout</button>
      </div>
    </header>
  )
}