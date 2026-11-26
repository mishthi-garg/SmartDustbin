export const DEFAULT_SETTINGS = {
  fill_warn: 60, fill_crit: 85,
  odor_warn: 300, odor_crit: 500,
  temp_warn: 40, temp_crit: 60,
  battery_low: 20, battery_ok: 30,
  offline_minutes: 10,
}

// changed in place by applySettings(), so every importer sees the live values
export const THRESHOLDS = {
  fill: { warn: 60, crit: 85 },
  odor: { warn: 300, crit: 500 },
  temp: { warn: 40, crit: 60 },
  tempEmergency: 60,
}

export let OFFLINE_MINUTES = 10

export function applySettings(s) {
  THRESHOLDS.fill.warn = s.fill_warn
  THRESHOLDS.fill.crit = s.fill_crit
  THRESHOLDS.odor.warn = s.odor_warn
  THRESHOLDS.odor.crit = s.odor_crit
  THRESHOLDS.temp.warn = s.temp_warn
  THRESHOLDS.temp.crit = s.temp_crit
  THRESHOLDS.tempEmergency = s.temp_crit
  OFFLINE_MINUTES = s.offline_minutes
}

export const ALERT_META = {
  fire:    { icon: '🔥', label: 'Fire / smoke' },
  full:    { icon: '🗑️', label: 'Bin full' },
  odor:    { icon: '🌫️', label: 'Odor alert' },
  animal:  { icon: '🐾', label: 'Animal activity' },
  battery: { icon: '🔋', label: 'Low battery' },
  offline: { icon: '📡', label: 'Sensor offline' },
}