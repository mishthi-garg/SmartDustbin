import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_HOME } from '../utils/roles'

export default function ProtectedRoute({ allow, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="hint">Loading…</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!allow.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />
  return children
}