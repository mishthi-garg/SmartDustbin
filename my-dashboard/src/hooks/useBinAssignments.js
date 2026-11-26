import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { MOCK_ASSIGNMENTS } from '../utils/mockBins'

export function useBinAssignments() {
  const [assignments, setAssignments] = useState({})

  const load = useCallback(async () => {
    if (!supabase) { setAssignments({ ...MOCK_ASSIGNMENTS }); return }
    const { data } = await supabase
      .from('bins').select('id, collecting_since, worker_id, workers(name)')
    if (!data) return
    setAssignments(Object.fromEntries(
      data.map((b) => [b.id, {
        worker: b.workers?.name ?? null,
        worker_id: b.worker_id,
        collecting_since: b.collecting_since,
      }])
    ))
  }, [])

  useEffect(() => {
    load()
    if (!supabase) return
    const channel = supabase
      .channel('bins-feed')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bins' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  return { assignments, refresh: load }
}