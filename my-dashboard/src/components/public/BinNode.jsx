import { CircleMarker, Tooltip } from 'react-leaflet'
import { getBinStatus, STATUS_COLORS } from '../../utils/colorCode'

export default function BinNode({ bin, selected, onSelect }) {
  const status = getBinStatus(bin)
  const color = STATUS_COLORS[status]

  const shared = {
    center: [bin.lat, bin.lng],
    eventHandlers: onSelect ? { click: () => onSelect(bin.id) } : {},
  }
  const ring = (fillOpacity) => ({
    color, fillColor: color, fillOpacity, weight: 1, opacity: 0.4,
    className: `bin-ring bin-${status}`,
  })

  return (
    <>
      <CircleMarker {...shared} radius={selected ? 34 : 28} pathOptions={ring(0.07)} />
      <CircleMarker {...shared} radius={selected ? 22 : 18} pathOptions={ring(0.14)} />
      <CircleMarker
        {...shared}
        radius={7}
        pathOptions={{
          color: '#fff', weight: 2, fillColor: color, fillOpacity: 1,
          className: `bin-core bin-${status}`,
        }}
      >
        <Tooltip>{bin.name}</Tooltip>
      </CircleMarker>
    </>
  )
}