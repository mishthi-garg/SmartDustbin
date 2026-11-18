import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { demoHistory } from '../utils/demoAnalytics'

const HOUR = 3600000
const FIELDS = 'created_at, fill_pct, temp_c, odor_index, battery_pct, animal_alert, smoke, rssi, uptime_s, reset_reason'
export function useSensorHistory(binId) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!binId) return
    if (!supabase) { setRows(demoHistory(binId)); return }

    setRows([])                      // don't flash the previous bin's data
    let alive = true

    supabase
      .from('readings').select(FIELDS)
      .eq('bin_id', binId)
      .gte('created_at', new Date(Date.now() - HOUR).toISOString())
      .order('created_at').limit(500)
      .then(({ data }) => { if (alive) setRows(data ?? []) })

    // append new readings live and drop anything older than an hour
    const channel = supabase
      .channel(`hist-${binId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'readings', filter: `bin_id=eq.${binId}` },
        (p) => setRows((prev) =>
          [...prev, p.new].filter((r) => Date.now() - new Date(r.created_at).getTime() < HOUR)))
      .subscribe()

    return () => { alive = false; supabase.removeChannel(channel) }
  }, [binId])

  return rows
}