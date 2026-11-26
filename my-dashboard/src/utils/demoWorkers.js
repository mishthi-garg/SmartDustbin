const ago = (min) => new Date(Date.now() - min * 60000).toISOString()

export const MOCK_WORKERS = [
  { id: 'w1', name: 'Ramesh', employee_id: 'EMP-101', phone: '98290 00001', email: 'ramesh@campus.in', shift_start: '06:00', shift_end: '14:00', active: true },
  { id: 'w2', name: 'Suresh', employee_id: 'EMP-102', phone: '98290 00002', email: null, shift_start: '14:00', shift_end: '22:00', active: true },
  { id: 'w3', name: 'Mahesh', employee_id: 'EMP-103', phone: '98290 00003', email: null, shift_start: '22:00', shift_end: '06:00', active: true },
]

export const demoPerformance = (days) => {
  const k = days >= 30 ? 4 : 1
  return [
    { worker_id: 'w1', name: 'Ramesh', collections: 9 * k, alerts: 7 * k, avg_response_min: 34,  on_time_pct: 86, missed: 0,     avg_ack_min: 5 },
    { worker_id: 'w2', name: 'Suresh', collections: 6 * k, alerts: 6 * k, avg_response_min: 71,  on_time_pct: 50, missed: 1 * k, avg_ack_min: 18 },
    { worker_id: 'w3', name: 'Mahesh', collections: 3 * k, alerts: 4 * k, avg_response_min: 112, on_time_pct: 25, missed: 2 * k, avg_ack_min: 41 },
  ]
}

export const MOCK_ALERT_HISTORY = [
  { id: 1, type: 'fire',   message: 'Smoke / high temperature', created_at: ago(5),   resolved_at: null,     acknowledged_at: null,    bins: { name: 'Hostel A' }, assigned: { name: 'Mahesh' }, acked: null },
  { id: 2, type: 'full',   message: 'Fill level 92%',           created_at: ago(95),  resolved_at: null,     acknowledged_at: ago(88), bins: { name: 'Library' },  assigned: { name: 'Ramesh' }, acked: { name: 'Ramesh' } },
  { id: 3, type: 'full',   message: 'Fill level 88%',           created_at: ago(300), resolved_at: ago(250), acknowledged_at: ago(280), bins: { name: 'Canteen' }, assigned: { name: 'Suresh' }, acked: { name: 'Suresh' } },
  { id: 4, type: 'animal', message: 'Animal activity detected', created_at: ago(600), resolved_at: ago(590), acknowledged_at: null,    bins: { name: 'Library' },  assigned: { name: 'Ramesh' }, acked: null },
]