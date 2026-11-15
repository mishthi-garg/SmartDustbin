import { CircleMarker, Tooltip } from 'react-leaflet'
import { getBinStatus, STATUS_COLORS } from '../../utils/colorCode'

export default function BinNode({ bin, selected, onSelect }) {
  const status = getBinStatus(bin)
  const color = STATUS_COLORS[status]

  return (
    <CircleMarker
      center={[bin.lat, bin.lng]}
      radius={selected ? 16 : 12}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 3,
        className: `bin-node bin-${status}`,
      }}
      eventHandlers={{ click: () => onSelect(bin.id) }}
    >
      <Tooltip>{bin.name}</Tooltip>
    </CircleMarker>
  )
}