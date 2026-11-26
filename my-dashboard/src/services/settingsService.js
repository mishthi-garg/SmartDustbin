import { supabase } from './supabase'
import { DEFAULT_SETTINGS } from '../utils/thresholds'

let demo = { ...DEFAULT_SETTINGS }          // demo mode keeps edits in memory

export async function fetchSettings() {
  if (!supabase) return { ...demo }
  const { data } = await supabase.from('alert_settings').select('*').single()
  return data ?? { ...DEFAULT_SETTINGS }
}

export async function saveSettings(values) {
  if (!supabase) { demo = { ...demo, ...values }; return { ok: true } }
  const { error } = await supabase.from('alert_settings').update(values).eq('id', true)
  return error ? { ok: false, error: error.message } : { ok: true }
}