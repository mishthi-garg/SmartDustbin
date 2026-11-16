import { OFFLINE_MINUTES } from './thresholds'
export const fmtPct = (v) => (v == null ? '--' : `${Math.round(v)}%`)
export const fmtTemp = (v) => (v == null ? '--' : `${v.toFixed(1)}°C`)

export function timeAgo(iso) {
  if (!iso) return '--'
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`
}

export function sensorHealth(bins) {
  const cutoff = Date.now() - OFFLINE_MINUTES * 60000
  const offline = bins.filter(
    (b) => !b.updated_at || new Date(b.updated_at).getTime() < cutoff
  ).length
  return { total: bins.length, offline, ok: offline === 0 }
}

// haversine distance in metres
export function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export const fmtDist = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)