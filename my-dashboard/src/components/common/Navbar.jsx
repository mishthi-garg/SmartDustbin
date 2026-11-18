import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABEL } from '../../utils/roles'

export default function Navbar({ title, onSearch, searchOptions = [], children }) {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      {onSearch ? (
        <label className="search">
          <Search size={16} />
          <input
            list="bin-names"
            placeholder="Search a bin or location…"
            onChange={(e) => onSearch(e.target.value)}
          />
          <datalist id="bin-names">
            {searchOptions.map((n) => <option key={n} value={n} />)}
          </datalist>
        </label>
      ) : (
        <h2>{title}</h2>
      )}

      <div className="topbar-right">
        {children}
        {user ? (
          <>
            <span className="user-chip">{user.full_name} · {ROLE_LABEL[user.role] ?? user.role}</span>
            <button className="report-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="report-btn">Staff login</Link>
        )}
      </div>
    </header>
  )
}