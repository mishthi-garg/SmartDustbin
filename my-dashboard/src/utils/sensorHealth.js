import { OFFLINE_MINUTES, THRESHOLDS as T } from './thresholds'

export const HEALTH_COLORS = {
  online: 'var(--ok)',
  warning: 'var(--warn)',
  offline: 'var(--bad)',
}

// edit this list to match the sensors you actually fitted
export const SENSORS = [
  { key: 'fill',   model: 'HC-SR04', label: 'Fill level',  field: 'fill_pct',     unit: '%',  valid: [0, 100],  normal: [0, T.fill.crit] },
  { key: 'odor',   model: 'MQ-135',  label: 'Odor / gas',  field: 'odor_index',   unit: '',   valid: [0, 1000], normal: [0, T.odor.warn] },
  { key: 'temp',   model: 'DHT11',   label: 'Temperature', field: 'temp_c',       unit: '°C', valid: [-10, 80], normal: [10, 40] },
  { key: 'motion', model: 'PIR',     label: 'Motion',      field: 'animal_alert', boolean: true },
]

// perfectly constant for a whole hour of samples → analog sensors always jitter a bit
const isFlat = (rows, field) => {
  const v = rows.map((r) => r[field]).filter((x) => x != null)
  return v.length >= 20 && v.every((x) => x === v[0])
}

export function evaluateSensors(bin, history = []) {
  const stale =
    !bin.updated_at ||
    Date.now() - new Date(bin.updated_at).getTime() > OFFLINE_MINUTES * 60000

  return SENSORS.map((s) => {
    const value = bin[s.field]
    let status = 'online'
    let note = 'Reading normally'

    if (stale) {
      status = 'offline'; note = 'No data from device'
    } else if (value == null) {
      status = 'offline'; note = 'Device alive, this sensor sends nothing'
    } else if (!s.boolean && (value < s.valid[0] || value > s.valid[1])) {
      status = 'warning'; note = 'Reading outside physical range'
    } else if (!s.boolean && isFlat(history, s.field)) {
      status = 'warning'; note = 'Value flat for 1 h, sensor may be stuck'
    }
    return { ...s, value, status, note }
  })
}
// The health score is deliberately simple and explainable: online counts 1, warning 0.5, offline 0, averaged.
const WEIGHT = { online: 1, warning: 0.5, offline: 0 }

export const healthScore = (sensors) =>
  sensors.length
    ? Math.round((sensors.reduce((s, x) => s + WEIGHT[x.status], 0) / sensors.length) * 100)
    : 0

export const healthLevel = (p) => (p >= 80 ? 'online' : p >= 50 ? 'warning' : 'offline')
export const batteryLevel = (p) => (p == null ? 'offline' : p >= 40 ? 'online' : p >= 20 ? 'warning' : 'offline')