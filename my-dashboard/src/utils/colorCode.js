import { THRESHOLDS as T } from './thresholds'

export const STATUS_COLORS = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  emergency: '#ef4444',
}

export function getBinStatus(b) {
  if (b.smoke || b.temp_c >= T.tempEmergency) return 'emergency'
  if (b.fill_pct >= T.fill.crit || b.odor_index >= T.odor.crit) return 'critical'
  if (b.fill_pct >= T.fill.warn || b.odor_index >= T.odor.warn || b.animal_alert)
    return 'warning'
  return 'normal'
}
const RANK = { emergency: 3, critical: 2, warning: 1, normal: 0 }
export const statusRank = (s) => RANK[s]

// status after accounting for "worker collected it since the last sensor reading"
export function withStatus(bin) {
  const raw = getBinStatus(bin)
  const done =
    !!bin.last_collected_at &&
    raw !== 'emergency' &&
    (!bin.updated_at || new Date(bin.last_collected_at) > new Date(bin.updated_at))
  return { ...bin, done, status: done ? 'normal' : raw }
}