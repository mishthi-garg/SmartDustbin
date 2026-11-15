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