import { useContext } from 'react'
import { BinContext } from '../context/BinContext'

export const useBinData = () => useContext(BinContext)