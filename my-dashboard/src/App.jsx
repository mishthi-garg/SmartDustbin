import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BinProvider } from './context/BinContext'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicMap from './pages/PublicMap'
import Login from './pages/Login'
import WorkerDashboard from './pages/WorkerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AnalyticsOverview from './components/admin/AnalyticsOverview'
import BinTrends from './components/admin/BinTrends'
import ProblematicBins from './components/admin/ProblematicBins'

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
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsOverview />} />
            <Route path="trends" element={<BinTrends />} />
            <Route path="problematic" element={<ProblematicBins />} />
          </Route>
        </Routes>
      </BinProvider>
    </AuthProvider>
  )
}