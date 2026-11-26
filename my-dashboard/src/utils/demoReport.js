import { MOCK_BINS } from './mockBins'
import { demoCollections } from './demoAnalytics'

const DAY = 86400000
const WORKERS = ['Ramesh', 'Suresh', 'Mahesh']

export function demoReportData({ from, to }) {
  const inRange = (iso) => {
    const t = new Date(iso).getTime()
    return t >= from.getTime() && t <= to.getTime()
  }

  const collections = demoCollections()
    .filter((c) => inRange(c.collected_at))
    .map((c) => ({ ...c, field_worker: { name: WORKERS[c.bin_id.charCodeAt(1) % 3] } }))

  const alerts = MOCK_BINS.flatMap((b, i) =>
    Array.from({ length: 56 }, (_, d) => d)
      .filter((d) => (d + i) % 4 === 0)
      .map((d) => {
        const created = new Date(Date.now() - d * DAY - 3 * 3600000)
        return {
          bin_id: b.id,
          type: b.id === 'b4' && d % 8 === 0 ? 'fire' : 'full',
          created_at: created.toISOString(),
          resolved_at: new Date(created.getTime() + 50 * 60000).toISOString(),
          assigned: { name: WORKERS[i % 3] },
          acked: { name: WORKERS[i % 3] },
        }
      })
  ).filter((a) => inRange(a.created_at))

  const hours = Math.max(1, Math.ceil((Math.min(to.getTime(), Date.now()) - from.getTime()) / 3600000))
  const pct = { b1: 0.99, b2: 0.96, b3: 0.91, b4: 0.84 }
  const uptime = MOCK_BINS.map((b) => ({ bin_id: b.id, hours_up: Math.round(hours * (pct[b.id] ?? 0.95)) }))

  return {
    bins: MOCK_BINS.map(({ id, name, kind }) => ({ id, name, kind })),
    collections, alerts, uptime, truncated: false,
  }
}