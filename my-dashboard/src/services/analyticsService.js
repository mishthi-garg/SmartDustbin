import { supabase } from './supabase'
import { demoCollections, demoHourly, demoProblemStats } from '../utils/demoAnalytics'

const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString()

export async function fetchCollections(days = 60) {
  if (!supabase) return demoCollections()
  const { data } = await supabase
    .from('collections').select('bin_id, collected_at')
    .gte('collected_at', daysAgo(days))
  return data ?? []
}

export async function fetchHourly(binId, days = 7) {
  if (!supabase) return demoHourly(binId, days)
  const { data } = await supabase
    .from('bin_hourly').select('hour, avg_fill, max_odor, max_temp')
    .eq('bin_id', binId).gte('hour', daysAgo(days)).order('hour')
  return data ?? []
}

export async function fetchProblemStats() {
  if (!supabase) return demoProblemStats()
  const { data } = await supabase.from('bin_problem_stats').select('*')
  return data ?? []
}