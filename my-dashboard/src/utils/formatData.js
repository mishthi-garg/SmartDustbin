export const fmtPct = (v) => (v == null ? '--' : `${Math.round(v)}%`)
export const fmtTemp = (v) => (v == null ? '--' : `${v.toFixed(1)}°C`)

export function timeAgo(iso) {
  if (!iso) return '--'
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`
}