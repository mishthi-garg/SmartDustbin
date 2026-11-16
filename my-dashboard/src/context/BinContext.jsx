import { createContext, useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { MOCK_BINS } from '../utils/mockBins'

export const BinContext = createContext(null)

export function BinProvider({ children }) {
  const [bins, setBins] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setBins(MOCK_BINS)
      setLoading(false)
      return
    }
    const { data } = await supabase.from('bin_status').select('*')
    if (data) setBins(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    if (!supabase) return

    const channel = supabase
      .channel('readings-feed')
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'readings' },
          load)
      .subscribe((s) => setLive(s === 'SUBSCRIBED'))

    return () => supabase.removeChannel(channel)
  }, [load])

  return (
    <BinContext.Provider value={{ bins, loading, live, refresh: load }}>
      {children}
    </BinContext.Provider>
  )
}