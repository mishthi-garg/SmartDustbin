import { Routes, Route } from 'react-router-dom'
import { BinProvider } from './context/BinContext'
import PublicMap from './pages/PublicMap'

export default function App() {
  return (
    <BinProvider>
      <Routes>
        <Route path="/" element={<PublicMap />} />
        {/* worker/admin/tech routes come later */}
      </Routes>
    </BinProvider>
  )
}