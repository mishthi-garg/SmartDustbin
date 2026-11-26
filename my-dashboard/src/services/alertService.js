import { supabase } from './supabase'
import { ALERT_META } from '../utils/thresholds'
import { MOCK_HISTORY, MOCK_ALERTS } from '../utils/mockBins'

export async function markCollected(binId) {
  if (!supabase) return { ok: true }
  const { error } = await supabase.rpc('mark_collected', { p_bin_id: binId })
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function resolveAlert(id) {
  if (!supabase) return { ok: true }
  const { error } = await supabase
    .from('alerts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function fetchHistory(limit = 50) {
  if (!supabase) return MOCK_HISTORY
  const { data } = await supabase
    .from('collections')
    .select('id, collected_at, worker_name, fill_before, bins(name), field_worker:workers(name)')
    .order('collected_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

// must be called from a button click (browsers block it otherwise)
export async function enableNotifications() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

export async function notifyAlert(a) {
  const meta = ALERT_META[a.type]
  if (!meta) return
  if (a.severity >= 3 && navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300])
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const title = `${meta.icon} ${meta.label}`
  const opts = { body: a.message, tag: `alert-${a.id}` }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) reg.showNotification(title, opts)   // Android Chrome only allows this form
    else new Notification(title, opts)
  } catch { /* some mobile browsers refuse; in-app feed still shows it */ }
}

export async function startCollecting(binId) {
  if (!supabase) return { ok: true }
  const { error } = await supabase.rpc('start_collecting', { p_bin_id: binId })
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function acknowledgeAlert(alertId, workerId, note = null) {
  if (!supabase) {
    const a = MOCK_ALERTS.find((x) => x.id === alertId)
    if (a && !a.acknowledged_at) {
      a.acknowledged_at = new Date().toISOString()
      a.acknowledged_worker_id = workerId
    }
    return { ok: true }
  }
  const { error } = await supabase.rpc('acknowledge_alert', {
    p_alert_id: alertId, p_worker_id: workerId, p_note: note,
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}