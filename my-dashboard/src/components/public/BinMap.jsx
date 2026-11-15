import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import BinNode from './BinNode'
import { CAMPUS_CENTER } from '../../utils/mockBins'

export default function BinMap({ bins, selectedId, onSelect }) {
  const route = bins.map((b) => [b.lat, b.lng])

  return (
    <MapContainer center={CAMPUS_CENTER} zoom={17} className="bin-map">
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline positions={route} pathOptions={{ color: '#38bdf8', weight: 2, dashArray: '6 8', opacity: 0.6 }} />
      {bins.map((b) => (
        <BinNode key={b.id} bin={b} selected={b.id === selectedId} onSelect={onSelect} />
      ))}
    </MapContainer>
  )
}