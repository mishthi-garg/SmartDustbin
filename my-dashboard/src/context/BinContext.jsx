import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { MOCK_BINS } from '../utils/mockBins'

export const BinContext = createContext(null)

export function BinProvider({ children }) {
  const [bins, setBins] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!supabase) {            // no backend yet → mock
      setBins(MOCK_BINS)
      setLoading(false)
      return
    }

    const load = async () => {
      const { data } = await supabase.from('bin_status').select('*')
      if (data) setBins(data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('readings-feed')
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'readings' },
          load)                 // simple: refetch on every new reading
      .subscribe((s) => setLive(s === 'SUBSCRIBED'))

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <BinContext.Provider value={{ bins, loading, live }}>
      {children}
    </BinContext.Provider>
  )
}