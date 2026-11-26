import { useCallback, useEffect, useState } from 'react'
import { listWorkers } from '../services/workerService'

export function useWorkers({ onlyActive = false } = {}) {
  const [workers, setWorkers] = useState([])
  const refresh = useCallback(() => listWorkers({ onlyActive }).then(setWorkers), [onlyActive])
  useEffect(() => { refresh() }, [refresh])
  return { workers, refresh }
}