export const THRESHOLDS = {
  fill: { warn: 60, crit: 85 },        // %
  odor: { warn: 300, crit: 500 },      // MQ-135 index, tune after calibration
  tempEmergency: 60,                   // °C → treat as fire
  temp: { warn: 40, crit: 60 },
}
export const OFFLINE_MINUTES = 10

export const ALERT_META = {
  fire:    { icon: '🔥', label: 'Fire / smoke' },
  full:    { icon: '🗑️', label: 'Bin full' },
  odor:    { icon: '🌫️', label: 'Odor alert' },
  animal:  { icon: '🐾', label: 'Animal activity' },
  offline: { icon: '📡', label: 'Sensor offline' },
  battery: { icon: '🔋', label: 'Low battery' },
}
