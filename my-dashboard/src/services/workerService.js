import { supabase } from './supabase'
import { MOCK_ASSIGNMENTS } from '../utils/mockBins'
import { MOCK_WORKERS, MOCK_ALERT_HISTORY, demoPerformance } from '../utils/demoWorkers'

const ok = { ok: true }
const fail = (error) => ({ ok: false, error: error.message })

export async function listWorkers({ onlyActive = false } = {}) {
  if (!supabase) return MOCK_WORKERS.filter((w) => !onlyActive || w.active).map((w) => ({ ...w }))
  let q = supabase.from('workers').select('*').order('name')
  if (onlyActive) q = q.eq('active', true)
  const { data } = await q
  return data ?? []
}

export async function saveWorker(w) {
  const row = {
    name: w.name.trim(),
    employee_id: w.employee_id?.trim() || null,
    phone: w.phone?.trim() || null,
    email: w.email?.trim() || null,
    shift_start: w.shift_start,
    shift_end: w.shift_end,
  }
  if (!supabase) {
    if (w.id) Object.assign(MOCK_WORKERS.find((x) => x.id === w.id), row)
    else MOCK_WORKERS.push({ id: 'w' + Date.now(), active: true, ...row })
    return ok
  }
  const { error } = w.id
    ? await supabase.from('workers').update(row).eq('id', w.id)
    : await supabase.from('workers').insert(row)
  return error ? fail(error) : ok
}

export async function setWorkerActive(id, active) {
  if (!supabase) {
    const w = MOCK_WORKERS.find((x) => x.id === id)
    w.active = active
    if (!active) {
      Object.keys(MOCK_ASSIGNMENTS).forEach((b) => {
        if (MOCK_ASSIGNMENTS[b].worker_id === id) MOCK_ASSIGNMENTS[b] = { ...MOCK_ASSIGNMENTS[b], worker: null, worker_id: null }
      })
    }
    return ok
  }
  const { error } = active
    ? await supabase.from('workers').update({ active: true }).eq('id', id)
    : await supabase.rpc('deactivate_worker', { p_worker_id: id })
  return error ? fail(error) : ok
}

export async function assignBin(binId, workerId) {
  if (!supabase) {
    const w = MOCK_WORKERS.find((x) => x.id === workerId)
    MOCK_ASSIGNMENTS[binId] = { ...MOCK_ASSIGNMENTS[binId], worker: w?.name ?? null, worker_id: workerId ?? null }
    return ok
  }
  const { error } = await supabase.rpc('assign_bin', { p_bin_id: binId, p_worker_id: workerId })
  return error ? fail(error) : ok
}

export async function reassignAll(fromId, toId) {
  if (!supabase) {
    const to = MOCK_WORKERS.find((x) => x.id === toId)
    Object.keys(MOCK_ASSIGNMENTS).forEach((b) => {
      if (MOCK_ASSIGNMENTS[b].worker_id === fromId) MOCK_ASSIGNMENTS[b] = { ...MOCK_ASSIGNMENTS[b], worker: to.name, worker_id: toId }
    })
    return ok
  }
  const { error } = await supabase.rpc('reassign_all_bins', { p_from: fromId, p_to: toId })
  return error ? fail(error) : ok
}

export async function fetchPerformance(days) {
  if (!supabase) return demoPerformance(days)
  const { data } = await supabase.rpc('worker_performance', { p_days: days })
  return data ?? []
}

export async function fetchAlertHistory(limit = 100) {
  if (!supabase) return MOCK_ALERT_HISTORY
  const { data } = await supabase
    .from('alerts')
    .select(`id, type, message, created_at, resolved_at, acknowledged_at,
             bins(name),
             assigned:workers!assigned_worker_id(name),
             acked:workers!acknowledged_worker_id(name)`)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}