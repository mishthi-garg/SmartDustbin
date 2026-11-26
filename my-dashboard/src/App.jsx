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
import TechnicianPanel from './pages/TechnicianPanel'
import AlertHistory from './components/admin/AlertHistory'
import WorkerTable from './components/admin/WorkerTable'
import BinAssignments from './components/admin/BinAssignments'
import WorkerPerformance from './components/admin/WorkerPerformance'
import CollectionLogs from './components/admin/CollectionLogs'
import { SettingsProvider } from './context/SettingsContext'
import SensorHealth from './components/admin/SensorHealth'
import AlertThresholds from './components/admin/AlertThresholds'
import ReportDownload from './components/admin/ReportDownload'

export default function App() {
  return (
    <SettingsProvider>
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
            <Route path="alerts" element={<AlertHistory />} />
<Route path="workers" element={<WorkerTable />} />
<Route path="assignments" element={<BinAssignments />} />
<Route path="performance" element={<WorkerPerformance />} />
<Route path="logs" element={<CollectionLogs />} />
<Route path="sensors" element={<SensorHealth />} />
<Route path="thresholds" element={<AlertThresholds />} />
<Route path="reports" element={<ReportDownload />} />
          </Route>
          <Route
            path="/tech"
            element={
              <ProtectedRoute allow={['technician', 'admin']}>
                <TechnicianPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BinProvider>
    </AuthProvider>
    </SettingsProvider>
  )
}