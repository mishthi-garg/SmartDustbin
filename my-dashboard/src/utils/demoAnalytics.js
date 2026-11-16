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
  }))
}

export const demoProblemStats = () =>
  MOCK_BINS.map((b, i) => ({
    bin_id: b.id, name: b.name,
    alerts_30d: 14 - i * 3, animal_30d: (i * 5) % 9, fire_30d: i === 3 ? 2 : 0,
    collections_30d: 20 - i, fill_per_hour: 4.2 - i * 0.8,
  }))