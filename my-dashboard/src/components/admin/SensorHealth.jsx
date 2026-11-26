import { useOutletContext } from 'react-router-dom'
import SensorHealthView from '../technician/SensorHealthView'

export default function SensorHealth() {
  const { alerts } = useOutletContext()
  return <SensorHealthView alerts={alerts} />
}