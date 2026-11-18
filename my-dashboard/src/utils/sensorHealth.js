import { OFFLINE_MINUTES } from './thresholds'
import { timeAgo } from './formatData'

export const EXPECTED_INTERVAL_S = 30   // how often the ESP32 posts
export const WINDOW_MIN = 60

// starting points: tune after a week of healthy data
export const LIMITS = {
  delivery: { warn: 90, bad: 70 },       // % of expected readings received in 1 h
  validity: { warn: 95, bad: 80 },       // % valid reads per sensor
  rssi: { warn: -80, bad: -90 },         // dBm
  battery: { warn: 40, bad: 20 },        // %
  drainPerDay: { warn: 20, bad: 40 },    // % battery per day
  driftPct: { warn: 25 },                // odor baseline rise over 14 days
}

// edit to match the sensors you actually fitted
export const SENSORS = [
  { key: 'fill',   model: 'HC-SR04', label: 'Fill level',  field: 'fill_pct',     valid: [0, 100],  maxNoise: 12,  maxStep: 40 },
  { key: 'odor',   model: 'MQ-135',  label: 'Odor / gas',  field: 'odor_index',   valid: [0, 1000], maxNoise: 100, maxStep: 250, flatCheck: true },
  { key: 'temp',   model: 'DHT11',   label: 'Temperature', field: 'temp_c',       valid: [-10, 80], maxNoise: 3,   maxStep: 8 },
  { key: 'motion', model: 'PIR',     label: 'Motion',      field: 'animal_alert', boolean: true },
]

export const HEALTH_COLORS = {
  online: 'var(--ok)', warning: 'var(--warn)', offline: 'var(--bad)', unknown: 'var(--muted)',
}
export const STATUS_PILL = { online: 'normal', warning: 'warning', offline: 'critical', unknown: 'unknown' }
export const STATUS_LABEL = { online: 'Healthy', warning: 'Check', offline: 'Fault', unknown: 'No data' }

const RANK = { unknown: -1, online: 0, warning: 1, offline: 2 }
const worst = (...s) => s.reduce((a, b) => (RANK[b] > RANK[a] ? b : a))
const grade = (v, { warn, bad }) => (v < bad ? 'offline' : v < warn ? 'warning' : 'online')   // higher is better

/* ---------------- sensor level ---------------- */
export function analyseSensor(s, rows, { stale = false, driftPct = null } = {}) {
  const raw = rows.map((r) => r[s.field])
  const isGood = (v) => v != null && (s.boolean || (v >= s.valid[0] && v <= s.valid[1]))
  const good = raw.filter(isGood)
  const validity = rows.length ? (good.length / rows.length) * 100 : 0

  let lastValidAt = null
  for (let i = rows.length - 1; i >= 0; i--) {
    if (isGood(raw[i])) { lastValidAt = rows[i].created_at; break }
  }

  let noise = null
  let spikes = 0
  if (!s.boolean && good.length >= 5) {
    const mean = good.reduce((a, b) => a + b, 0) / good.length
    noise = Math.sqrt(good.reduce((a, b) => a + (b - mean) ** 2, 0) / good.length)
    for (let i = 1; i < good.length; i++) {
      if (Math.abs(good[i] - good[i - 1]) > s.maxStep) spikes++
    }
  }

  const flat = !!s.flatCheck && good.length >= 20 && good.every((v) => v === good[0])
  const stuckOn = !!s.boolean && good.length >= 20 && good.filter(Boolean).length / good.length > 0.95
  

  // first match wins, ordered by severity
  let status = 'online'
  let note = 'Healthy'
  if (stale)                                         { status = 'offline'; note = 'No data from device' }
  else if (!rows.length)                             { status = 'offline'; note = 'No readings in the last hour' }
  else if (validity < LIMITS.validity.bad)           { status = 'offline'; note = `Only ${Math.round(validity)}% of reads valid` }
  else if (validity < LIMITS.validity.warn)          { status = 'warning'; note = `${Math.round(validity)}% valid: intermittent fault` }
  else if (flat)                                     { status = 'warning'; note = 'Perfectly flat for 1 h, may be stuck' }
  else if (stuckOn)                                  { status = 'warning'; note = 'Stuck ON: sensor fault or heat/wind interference' }
  else if (noise != null && noise > s.maxNoise)      { status = 'warning'; note = 'Very noisy: loose wire or EMI?' }
  else if (spikes >= 3)                              { status = 'warning'; note = `${spikes} spikes: check supply and wiring` }
  

  return { ...s, validity, noise, spikes, lastValidAt, status, note }
}

/* ---------------- device level ---------------- */
function drainPerDay(hourly) {
  const v = hourly.map((h) => h.min_battery).filter((x) => x != null)
  if (v.length < 12) return null
  let drops = 0
  for (let i = 1; i < v.length; i++) if (v[i] < v[i - 1]) drops += v[i - 1] - v[i]   // ignore recharges
  return drops / (v.length / 24)
}

const fmtUptime = (s) => (s >= 86400 ? `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h` : s >= 3600 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 60)}m`)
const lastWith = (rows, f) => [...rows].reverse().find((r) => r[f] != null)

export function evaluateDevice(bin, rows, hourly = []) {
  const ageMin = bin.updated_at ? (Date.now() - new Date(bin.updated_at).getTime()) / 60000 : Infinity
  const stale = ageMin > OFFLINE_MINUTES
  const metrics = []

  metrics.push({
    key: 'fresh', label: 'Last data',
    value: bin.updated_at ? timeAgo(bin.updated_at) : 'never',
    detail: `fault after ${OFFLINE_MINUTES} min`,
    status: stale ? 'offline' : ageMin > OFFLINE_MINUTES / 2 ? 'warning' : 'online',
  })

  const expected = (WINDOW_MIN * 60) / EXPECTED_INTERVAL_S
  const delivery = Math.min(100, Math.round((rows.length / expected) * 100))
  metrics.push({
    key: 'delivery', label: 'Delivery', value: `${delivery}%`,
    detail: `${rows.length} of ${expected} readings in 1 h`,
    status: grade(delivery, LIMITS.delivery),
  })

  const battery = bin.battery_pct
  const drain = drainPerDay(hourly)
  const drainStatus = drain == null ? 'online' : drain > LIMITS.drainPerDay.bad ? 'offline' : drain > LIMITS.drainPerDay.warn ? 'warning' : 'online'
  metrics.push({
    key: 'battery', label: 'Battery',
    value: battery == null ? '--' : `${battery}%`,
    detail: drain == null ? 'drain: not enough history' : `draining ~${drain.toFixed(0)}% per day`,
    status: battery == null ? 'unknown' : worst(grade(battery, LIMITS.battery), drainStatus),
  })

  const rssi = lastWith(rows, 'rssi')?.rssi
  metrics.push({
    key: 'rssi', label: 'Wi-Fi signal',
    value: rssi == null ? '--' : `${rssi} dBm`,
    detail: rssi == null ? 'not reported by firmware' : `weak below ${LIMITS.rssi.warn} dBm`,
    status: rssi == null ? 'unknown' : grade(rssi, LIMITS.rssi),
  })

  const ups = rows.map((r) => r.uptime_s).filter((v) => v != null)
  let reboots = 0
  for (let i = 1; i < ups.length; i++) if (ups[i] < ups[i - 1]) reboots++
  const lastReset = lastWith(rows, 'reset_reason')?.reset_reason
  const recentBoot = ups.length > 0 && ups[ups.length - 1] < 3600
  const badReset = ['brownout', 'watchdog', 'crash'].includes(lastReset)
  metrics.push({
    key: 'stability', label: 'Stability',
    value: ups.length ? `${reboots} reboot${reboots === 1 ? '' : 's'}/h` : '--',
    detail: ups.length ? `up ${fmtUptime(ups[ups.length - 1])} · last reset: ${lastReset ?? 'n/a'}` : 'not reported by firmware',
    status: !ups.length ? 'unknown' : reboots >= 2 ? 'offline' : reboots === 1 || (recentBoot && badReset) ? 'warning' : 'online',
  })

  return { metrics, stale }
}

/* ---------------- helpers ---------------- */
export function healthScore(items) {
  const w = { online: 1, warning: 0.5, offline: 0 }
  const used = items.filter((x) => x.status !== 'unknown')
  return used.length ? Math.round((used.reduce((s, x) => s + w[x.status], 0) / used.length) * 100) : 0
}
export const healthLevel = (p) => (p >= 80 ? 'online' : p >= 50 ? 'warning' : 'offline')
export const batteryLevel = (p) => (p == null ? 'offline' : p >= 40 ? 'online' : p >= 20 ? 'warning' : 'offline')

// readings received per 5-minute bucket over the last hour
export function deliveryBuckets(rows, minutes = 5, windowMin = WINDOW_MIN) {
  const n = windowMin / minutes
  const now = Date.now()
  const buckets = Array.from({ length: n }, (_, i) => ({
    t: new Date(now - (n - 1 - i) * minutes * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    received: 0,
  }))
  rows.forEach((r) => {
    const idx = n - 1 - Math.floor((now - new Date(r.created_at).getTime()) / (minutes * 60000))
    if (idx >= 0 && idx < n) buckets[idx].received += 1
  })
  return buckets
}

// odor baseline: last 3 days vs first 3 days of the 14-day window
export function driftPct(baseline) {
  const v = baseline.map((b) => b.odor_baseline).filter((x) => x != null)
  if (v.length < 7) return null
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length
  const early = avg(v.slice(0, 3))
  const late = avg(v.slice(-3))
  return early > 0 ? ((late - early) / early) * 100 : null
}