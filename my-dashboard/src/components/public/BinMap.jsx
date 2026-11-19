import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import BinNode from './BinNode'
import { STATUS_COLORS } from '../../utils/colorCode'
import { CAMPUS_CENTER } from '../../utils/mockBins'

function FlyTo({ bin }) {
  const map = useMap()
  // depend on lat/lng (primitives), not the bin object: it's a new object on every realtime refetch
  useEffect(() => {
    if (bin) map.flyTo([bin.lat, bin.lng], 18, { duration: 0.6 })
  }, [bin?.lat, bin?.lng, map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

const LEGEND = [
  ['Normal', 'normal'],
  ['Attention', 'warning'],
  ['Critical', 'critical'],
  ['Emergency', 'emergency'],
]

export default function BinMap({ bins, selected, onSelect }) {
  const route = bins.map((b) => [b.lat, b.lng])

  return (
    <div className="map-wrap">
      <MapContainer center={CAMPUS_CENTER} zoom={17} className="bin-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${import.meta.env.VITE_CARTO_API_KEY}`}
        />
        <Polyline
          positions={route}
          pathOptions={{ color: '#60a5fa', weight: 1.5, opacity: 0.6, dashArray: '4 6' }}
        />
        {bins.map((b) => (
          <BinNode key={b.id} bin={b} selected={b.id === selected?.id} onSelect={onSelect} />
        ))}
        <FlyTo bin={selected} />
      </MapContainer>

      <div className="map-legend">
        {LEGEND.map(([label, key]) => (
          <span key={key}>
            <i className={`dot ${key === 'emergency' ? 'pulse' : ''}`} style={{ background: STATUS_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}