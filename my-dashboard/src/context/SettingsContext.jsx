import { createContext, useCallback, useEffect, useState } from 'react'
import { fetchSettings } from '../services/settingsService'
import { applySettings, DEFAULT_SETTINGS } from '../utils/thresholds'

export const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [version, setVersion] = useState(0)
  const [ready, setReady] = useState(false)

  const reload = useCallback(async () => {
    const s = await fetchSettings()
    applySettings(s)
    setSettings(s)
    setVersion((v) => v + 1)      // BinProvider reads this, so every screen re-renders with the new numbers
    setReady(true)
  }, [])

  useEffect(() => { reload() }, [reload])

  if (!ready) return <p className="hint">Loading…</p>

  return (
    <SettingsContext.Provider value={{ settings, version, reload }}>
      {children}
    </SettingsContext.Provider>
  )
}