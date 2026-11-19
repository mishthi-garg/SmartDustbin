import { useEffect, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { workerState, STATE_RANK, STATE_LABEL } from '../../utils/colorCode'
import { fmtPct, fmtTemp, timeAgo } from '../../utils/formatData'
import { markCollected, startCollecting } from '../../services/alertService'
import ProgressCircle from '../common/ProgressCircle'
import BinFillIcon from './BinFillIcon'     // replaces the ProgressCircle import

export default function BinList({ bins, assignments, onChanged, onReport, onDetails }) {
  const [menu, setMenu] = useState(null)       // { bin, top, right }
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [menu])

  // worst first: emergency, full, collecting, attention, ok, done
  const rows = bins
    .map((b) => workerState(b, assignments[b.id]))
    .sort((a, b) =>
      STATE_RANK[b.state] - STATE_RANK[a.state] || (b.fill_pct ?? 0) - (a.fill_pct ?? 0))

  const openMenu = (e, row) => {
    e.stopPropagation()                         // otherwise the window click listener closes it instantly
    const rect = e.currentTarget.getBoundingClientRect()
    setMenu(menu?.bin.id === row.id ? null : {
      bin: row, top: rect.bottom + 4, right: window.innerWidth - rect.right,
    })
  }

  const run = async (fn, bin, confirmText) => {
    setMenu(null)
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(bin.id)
    const res = await fn(bin.id)
    setBusyId(null)
    if (res.ok) onChanged()
    else window.alert(res.error)
  }

  return (
    <>
      <div className="table-wrap">
        <table className="bin-table">
          <thead>
            <tr>
              <th>#</th><th>Bin</th><th>Status</th><th>Fill</th><th>Odor</th>
              <th>Temp</th><th>Last collected</th><th>Assigned to</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td><b>{b.name}</b></td>
                <td>
                  <span className="status-cell">
                    {/* <ProgressCircle state={b.state} fill={b.fill_pct ?? 0} /> */}
                    <BinFillIcon state={b.state} fill={b.fill_pct ?? 0} />
                    {STATE_LABEL[b.state]}
                  </span>
                </td>
                <td>{fmtPct(b.fill_pct)}</td>
                <td>{b.odor_index ?? '--'}</td>
                <td>{fmtTemp(b.temp_c)}</td>
                <td>{timeAgo(b.last_collected_at)}</td>
                <td>{b.worker ?? <span className="muted">Unassigned</span>}</td>
                <td>
                  <button className="icon-btn" disabled={busyId === b.id}
                    onClick={(e) => openMenu(e, b)} aria-label="Actions">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {menu && (
        <div className="action-menu" style={{ top: menu.top, right: menu.right }}
          onClick={(e) => e.stopPropagation()}>
          {!menu.bin.collecting && (
            <button onClick={() => run(startCollecting, menu.bin)}>Start collecting</button>
          )}
          <button onClick={() => run(markCollected, menu.bin, `Mark "${menu.bin.name}" as collected?`)}>
            Mark as collected
          </button>
          <button onClick={() => { setMenu(null); onDetails(menu.bin.id) }}>View details</button>
          <button onClick={() => { setMenu(null); onReport(menu.bin.id) }}>Report issue</button>
        </div>
      )}
    </>
  )
}