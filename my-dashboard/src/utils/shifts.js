export const SHIFT_PRESETS = {
  morning: ['06:00', '14:00'],
  evening: ['14:00', '22:00'],
  night: ['22:00', '06:00'],
}

const toMin = (t) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

export function minutesNowIST() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata',
  }).formatToParts(new Date())
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  return get('hour') * 60 + get('minute')
}

export function isOnShift(w, at = minutesNowIST()) {
  const s = toMin(w.shift_start)
  const e = toMin(w.shift_end)
  return s <= e ? at >= s && at < e : at >= s || at < e     // night shifts wrap past midnight
}

export function shiftLabel(w) {
  const s = w.shift_start.slice(0, 5)
  const e = w.shift_end.slice(0, 5)
  const hit = Object.entries(SHIFT_PRESETS).find(([, [ps, pe]]) => ps === s && pe === e)
  return `${hit ? hit[0][0].toUpperCase() + hit[0].slice(1) : 'Custom'} · ${s}–${e}`
}