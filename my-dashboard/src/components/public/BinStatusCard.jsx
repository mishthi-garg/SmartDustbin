import { Gauge, Thermometer, Wind, PawPrint } from 'lucide-react'
import { THRESHOLDS as T } from '../../utils/thresholds'
import { levelOf } from '../../utils/colorCode'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'

const PILL = { normal: 'Normal', warning: 'Watch', critical: 'High' }
const nums = (list, key) => list.map((b) => b[key]).filter((v) => v != null)
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null)

function StatCard({ label, value, icon: Icon, level, text, percent }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div><small>{label}</small><b>{value}</b></div>
        <span className={`stat-icon ${level}`}><Icon size={18} /></span>
      </div>
      <span className={`pill ${level}`}>{text}</span>
      <div className={`bar ${level}`}>
        <i style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  )
}

export default function BinStatusCard({ bins, bin }) {
  const scope = bin ? [bin] : bins
  const fill = avg(nums(scope, 'fill_pct'))
  const temp = avg(nums(scope, 'temp_c'))
  const odor = Math.max(0, ...nums(scope, 'odor_index'))   // worst bin wins
  const animals = scope.filter((b) => b.animal_alert).length

  const fillLv = levelOf(fill, T.fill.warn, T.fill.crit)
  const tempLv = levelOf(temp, T.temp.warn, T.temp.crit)
  const odorLv = levelOf(odor, T.odor.warn, T.odor.crit)
  const animalLv = animals ? 'warning' : 'normal'

  return (
    <section>
      <div className="scope-line">
        <b>{bin ? bin.name : 'Campus overview'}</b>
        <small>
          {bin
            ? `Updated ${timeAgo(bin.updated_at)} · Last collected ${timeAgo(bin.last_collected_at)}`
            : 'Average across all bins · tap a node for one bin'}
        </small>
      </div>

      {bin && odor >= T.odor.warn && (
        <div className="odor-banner">⚠ Odor alert, avoid this area</div>
      )}

      <div className="stat-grid">
        <StatCard label="FILL LEVEL" value={fmtPct(fill)} icon={Gauge}
          level={fillLv} text={PILL[fillLv]} percent={fill ?? 0} />
        <StatCard label="TEMPERATURE" value={fmtTemp(temp)} icon={Thermometer}
          level={tempLv} text={PILL[tempLv]} percent={((temp ?? 0) / T.temp.crit) * 100} />
        <StatCard label="ODOR INDEX" value={odor || '--'} icon={Wind}
          level={odorLv} text={PILL[odorLv]} percent={(odor / T.odor.crit) * 100} />
        <StatCard label="ANIMAL ALERTS" value={bin ? (animals ? 'Yes' : 'No') : animals} icon={PawPrint}
          level={animalLv}
          text={animals ? (bin ? 'Detected' : `${animals} bin${animals > 1 ? 's' : ''}`) : 'None'}
          percent={(animals / (scope.length || 1)) * 100} />
      </div>
    </section>
  )
}