import { useContext, useState } from 'react'
import { SettingsContext } from '../../context/SettingsContext'
import { saveSettings } from '../../services/settingsService'
import { DEFAULT_SETTINGS } from '../../utils/thresholds'

const GROUPS = [
  { title: 'Fill level', unit: '%', hint: 'Yellow at the warning value. A "bin full" alert at the alert value.',
    fields: [['fill_warn', 'Warning at'], ['fill_crit', 'Alert at']] },
  { title: 'Odor index', unit: '', hint: 'MQ-135 index.',
    fields: [['odor_warn', 'Warning at'], ['odor_crit', 'Alert at']] },
  { title: 'Temperature', unit: '°C', hint: 'The alert value raises a fire / smoke alert (also sent to guards).',
    fields: [['temp_warn', 'Warning at'], ['temp_crit', 'Fire alert at']] },
  { title: 'Device battery', unit: '%', hint: 'Alert at or below the first value. Clears once recharged to the second.',
    fields: [['battery_low', 'Alert at or below'], ['battery_ok', 'Cleared at or above']] },
  { title: 'Sensor offline', unit: 'min', hint: 'No readings for this long means the device is offline.',
    fields: [['offline_minutes', 'Offline after']] },
]

const PAIRS = [['fill_warn', 'fill_crit', 'Fill'], ['odor_warn', 'odor_crit', 'Odor'],
               ['temp_warn', 'temp_crit', 'Temperature'], ['battery_low', 'battery_ok', 'Battery']]

export default function AlertThresholds() {
  const { settings, reload } = useContext(SettingsContext)
  const [f, setF] = useState(() => ({ ...settings }))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.value })); setSaved(false) }

  const validate = () => {
    const n = Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map((k) => [k, Number(f[k])]))
    if (Object.values(n).some((v) => !Number.isFinite(v) || v < 0)) return { error: 'Every field needs a number' }
    if (n.fill_crit > 100 || n.battery_ok > 100) return { error: 'Percentages cannot exceed 100' }
    if (n.offline_minutes < 1) return { error: 'Offline time must be at least 1 minute' }
    for (const [a, b, name] of PAIRS) {
      if (n[a] >= n[b]) return { error: `${name}: the first value must be lower than the second` }
    }
    return { values: n }
  }

  const save = async () => {
    const v = validate()
    if (v.error) return setError(v.error)
    setError('')
    setBusy(true)
    const res = await saveSettings(v.values)
    setBusy(false)
    if (!res.ok) return setError(res.error)
    await reload()
    setSaved(true)
  }

  return (
    <>
      <h1 className="page-title">Alert thresholds</h1>
      <p className="panel-sub">
        New readings use these values immediately. Alerts that are already open are not changed.
      </p>

      <div className="rank-grid">
        {GROUPS.map((g) => (
          <section key={g.title} className="panel th-card">
            <div className="panel-head"><h3>{g.title}</h3></div>
            <p className="panel-sub">{g.hint}</p>
            {g.fields.map(([key, label]) => (
              <label key={key} className="field">
                <span>{label}</span>
                <span>
                  <input type="number" value={f[key]} onChange={set(key)} />
                  <span className="th-unit">{g.unit}</span>
                </span>
              </label>
            ))}
          </section>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="th-actions">
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save thresholds'}</button>
        <button className="report-btn" onClick={() => { setF({ ...DEFAULT_SETTINGS }); setSaved(false) }}>
          Reset to defaults
        </button>
        {saved && <span className="ok-text">Saved ✓</span>}
      </div>
    </>
  )
}