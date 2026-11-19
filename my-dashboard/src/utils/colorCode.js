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

// generic 3-level classifier for stat cards
export function levelOf(value, warn, crit) {
  if (value == null) return 'normal'
  return value >= crit ? 'critical' : value >= warn ? 'warning' : 'normal'
}

const COLLECTING_MAX_MIN = 120   // older "collecting" marks are treated as abandoned

export const STATE_RANK = { emergency: 5, full: 4, collecting: 3, attention: 2, ok: 1, done: 0 }
export const STATE_LABEL = {
  emergency: 'Emergency', full: 'Full', collecting: 'Collecting',
  attention: 'Attention', ok: 'OK', done: 'Done',
}

// bin + its assignment record → the one state the supervisor list shows
export function workerState(bin, a) {
  const b = withStatus(bin)
  const collecting =
    !!a?.collecting_since &&
    Date.now() - new Date(a.collecting_since).getTime() < COLLECTING_MAX_MIN * 60000

  const state =
    b.status === 'emergency' ? 'emergency'
    : collecting ? 'collecting'
    : b.done ? 'done'
    : b.status === 'critical' ? 'full'
    : b.status === 'warning' ? 'attention'
    : 'ok'

  return { ...b, state, collecting, worker: a?.worker ?? null }
}