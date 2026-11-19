export const CAMPUS_CENTER = [26.9366, 75.9235]

export const MOCK_BINS = [
  { id: 'b1', name: 'Main Gate',  lat: 26.937787, lng: 75.922844, battery_pct: 82, kind: 'dry', fill_pct: 35, temp_c: 29, odor_index: 120, animal_alert: false, smoke: false, updated_at: new Date().toISOString() },
  { id: 'b2', name: 'Canteen',    lat: 26.934728, lng: 75.923427, battery_pct: 46, kind: 'wet', fill_pct: 72, temp_c: 31, odor_index: 340, animal_alert: false, smoke: false, updated_at: new Date().toISOString() },
  { id: 'b3', name: 'Basketball Court',    lat: 26.933037, lng: 75.922628, battery_pct: 18, kind: 'dry', fill_pct: 92, temp_c: 30, odor_index: null, animal_alert: true,  smoke: false, updated_at: new Date().toISOString() },
  { id: 'b4', name: 'Incubation',   lat: 26.936080, lng: 75.925480, battery_pct: 63, kind: 'wet', fill_pct: 20, temp_c: 68, odor_index: 600, animal_alert: false, smoke: true,  updated_at: new Date().toISOString() },
]

const ago = (min) => new Date(Date.now() - min * 60000).toISOString()

export const MOCK_ALERTS = [
  { id: 1, bin_id: 'b4', type: 'fire',   severity: 3, message: 'Smoke / high temperature', created_at: ago(2) },
  { id: 2, bin_id: 'b3', type: 'full',   severity: 2, message: 'Fill level 92%',           created_at: ago(14) },
  { id: 3, bin_id: 'b3', type: 'animal', severity: 1, message: 'Animal activity detected', created_at: ago(30) },
]

// export const MOCK_HISTORY = [
//   { id: 1, bin_id: 'b2', collected_at: ago(180), worker_name: 'Ramesh', fill_before: 88, bins: { name: 'Canteen' } },
//   { id: 2, bin_id: 'b3', collected_at: ago(420), worker_name: 'Suresh', fill_before: 91, bins: { name: 'Library' } },
// ]

export const MOCK_HISTORY = [
  { id: 1, field_worker: { name: 'Ramesh' }, bin_id: 'b2', collected_at: ago(180), worker_name: 'Ramesh', fill_before: 88, bins: { name: 'Canteen' } },
  { id: 2, field_worker: { name: 'Suresh' }, bin_id: 'b3', collected_at: ago(420), worker_name: 'Suresh', fill_before: 91, bins: { name: 'Library' } },
]

export const MOCK_ASSIGNMENTS = {
  b1: { worker: 'Ramesh', collecting_since: null },
  b2: { worker: 'Suresh', collecting_since: null },
  b3: { worker: 'Ramesh', collecting_since: new Date(Date.now() - 10 * 60000).toISOString() },
  b4: { worker: 'Mahesh', collecting_since: null },
}