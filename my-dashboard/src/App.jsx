import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BinProvider } from './context/BinContext'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicMap from './pages/PublicMap'
import Login from './pages/Login'
import WorkerDashboard from './pages/WorkerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BinProvider>
        <Routes>
          <Route path="/" element={<PublicMap />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/worker"
            element={
              <ProtectedRoute allow={['worker', 'admin']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          {/* /admin and /tech come later */}
        </Routes>
      </BinProvider>
    </AuthProvider>
  )
}