import { useState } from 'react'
import { STATUS_COLORS, statusRank, withStatus } from '../../utils/colorCode'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'
import { markCollected } from '../../services/alertService'
import StatusDot from '../common/StatusDot'

const LABEL = { emergency: 'Emergency', critical: 'Needs pickup', warning: 'Attention', normal: 'OK' }

export default function BinList({ bins, onChanged, onReport }) {
  const [busyId, setBusyId] = useState(null)

  // priority: worst status first, then fullest first
  const rows = bins
    .map(withStatus)
    .sort((a, b) =>
      statusRank(b.status) - statusRank(a.status) || (b.fill_pct ?? 0) - (a.fill_pct ?? 0))

  const collect = async (bin) => {
    if (!window.confirm(`Mark "${bin.name}" as collected?`)) return
    setBusyId(bin.id)
    const res = await markCollected(bin.id)
    setBusyId(null)
    if (res.ok) onChanged()
    else window.alert(res.error)
  }

  return (
    <div className="table-wrap">
      <table className="bin-table">
        <thead>
          <tr>
            <th>#</th><th>Bin</th><th>Fill</th><th>Odor</th><th>Temp</th>
            <th>Last collected</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b, i) => (
            <tr key={b.id}>
              <td>{i + 1}</td>
              <td>{b.name}</td>
              <td>{fmtPct(b.fill_pct)}</td>
              <td>{b.odor_index ?? '--'}</td>
              <td>{fmtTemp(b.temp_c)}</td>
              <td>{timeAgo(b.last_collected_at)}</td>
              <td>
                <StatusDot color={STATUS_COLORS[b.status]} pulse={b.status === 'emergency'} />
                {b.done ? 'Collected' : LABEL[b.status]}
              </td>
              <td className="actions">
                <button disabled={busyId === b.id} onClick={() => collect(b)}>
                  {busyId === b.id ? '…' : 'Collected'}
                </button>
                <button onClick={() => onReport(b.id)}>Report</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}