import { MOCK_BINS } from './mockBins'

const DAY = 86400000

export function demoCollections() {
  const rows = []
  MOCK_BINS.forEach((b, i) => {
    for (let d = 0; d < 56; d++) {
      if ((d * 5 + i * 3) % 3 !== 0) {
        rows.push({ bin_id: b.id, collected_at: new Date(Date.now() - d * DAY).toISOString() })
      }
    }
  })
  return rows
}

export function demoHourly(binId, days = 7) {
  const i = MOCK_BINS.findIndex((b) => b.id === binId) + 1
  return Array.from({ length: days * 24 }, (_, h) => ({
    hour: new Date(Date.now() - (days * 24 - h) * 3600000).toISOString(),
    avg_fill: (h * (2 + i)) % 100,
    max_odor: 150 + ((h * 37 * i) % 250),
    max_temp: 27 + ((h * i) % 7),
    min_battery: Math.max(5, 95 - (h / 24) * (5 + i * 4)),
  }))
}

export const demoProblemStats = () =>
  MOCK_BINS.map((b, i) => ({
    bin_id: b.id, name: b.name,
    alerts_30d: 14 - i * 3, animal_30d: (i * 5) % 9, fire_30d: i === 3 ? 2 : 0,
    collections_30d: 20 - i, fill_per_hour: 4.2 - i * 0.8,
  }))

export function demoHistory(binId) {
  const i = MOCK_BINS.findIndex((b) => b.id === binId) + 1
  const rows = []
  for (let n = 119; n >= 0; n--) {
    if (i === 4 && n % 5 < 2) continue            // b4: ~40% of readings never arrive
    const m = 119 - n
    rows.push({
      created_at: new Date(Date.now() - n * 30000).toISOString(),
      fill_pct: 30 + i * 10 + Math.round(Math.sin(m / 8) * 3),
      temp_c: Math.round((28 + Math.sin(m / 10 + i) * 1.5) * 10) / 10,
      odor_index: i === 3 && m % 3 === 0 ? null : 150 + i * 40 + Math.round(Math.sin(m / 5) * 40),  // b3: flaky odor sensor
      battery_pct: 80 - i * 10,
      animal_alert: false,
      smoke: false,
      rssi: i === 2 ? -84 : -60 - i * 3,          // b2: weak signal
      uptime_s: 86400 * i + m * 30,
      reset_reason: 'poweron',
    })
  }
  return rows
}

export const demoBaseline = (binId) => {
  const i = MOCK_BINS.findIndex((b) => b.id === binId) + 1
  return Array.from({ length: 14 }, (_, d) => ({
    day: new Date(Date.now() - (13 - d) * 86400000).toISOString(),
    odor_baseline: 120 + (i === 1 ? d * 6 : 0),   // b1: baseline creeping up
  }))
}