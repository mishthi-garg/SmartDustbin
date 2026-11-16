import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import { notifyAlert } from '../services/alertService'
import { BinContext } from '../context/BinContext'
import { OFFLINE_MINUTES } from '../utils/thresholds'
import { MOCK_ALERTS } from '../utils/mockBins'

export function useAlerts() {
  const { bins } = useContext(BinContext)
  const [stored, setStored] = useState([])

  const load = useCallback(async () => {
    if (!supabase) { setStored(MOCK_ALERTS); return }
    const { data } = await supabase
      .from('alerts').select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
    if (data) setStored(data)
  }, [])

  useEffect(() => {
    load()
    if (!supabase) return
    const channel = supabase
      .channel('alerts-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (p) => {
        if (p.eventType === 'INSERT') notifyAlert(p.new)
        load()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  // "sensor offline" isn't stored, it's derived from how old the last reading is
  const alerts = useMemo(() => {
    const cutoff = Date.now() - OFFLINE_MINUTES * 60000
    const offline = bins
      .filter((b) => !b.updated_at || new Date(b.updated_at).getTime() < cutoff)
      .map((b) => ({
        id: `offline-${b.id}`, bin_id: b.id, type: 'offline', severity: 1,
        message: 'No data from sensor', created_at: b.updated_at, derived: true,
      }))
    return [...stored, ...offline].sort(
      (a, b) => b.severity - a.severity || new Date(b.created_at) - new Date(a.created_at)
    )
  }, [stored, bins])

  return { alerts, refresh: load }
}