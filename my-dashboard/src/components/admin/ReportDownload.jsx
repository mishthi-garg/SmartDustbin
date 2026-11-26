import { useState } from 'react'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { fetchReportData, buildReport, exportCSV, exportPDF, fmtHours } from '../../services/reportService'

const toInput = (d) => d.toLocaleDateString('en-CA')          // YYYY-MM-DD in local time

export default function ReportDownload() {
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 6); return toInput(d) })
  const [to, setTo] = useState(() => toInput(new Date()))
  const [kind, setKind] = useState('both')
  const [report, setReport] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [error, setError] = useState('')

  // changing any input invalidates the preview
  const edit = (setter) => (v) => { setter(v); setReport(null) }

  const preset = (key) => {
    const end = new Date()
    const start = new Date()
    if (key === '7') start.setDate(end.getDate() - 6)
    else if (key === '30') start.setDate(end.getDate() - 29)
    else start.setDate(1)                                     // this month
    setFrom(toInput(start))
    setTo(toInput(end))
    setReport(null)
  }

  const generate = async () => {
    const f = new Date(`${from}T00:00:00`)
    const t = new Date(`${to}T23:59:59.999`)
    if (isNaN(f) || isNaN(t) || f > t) return setError('Pick a valid date range')
    if (t - f > 366 * 86400000) return setError('The maximum range is one year')
    setError('')
    setBusy(true)
    try {
      const data = await fetchReportData({ from: f, to: t })
      setReport(buildReport(data, { from: f, to: t, kind }))
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }

  const downloadPDF = async () => {
    setPdfBusy(true)
    try { await exportPDF(report) } catch (e) { setError(e.message) }
    setPdfBusy(false)
  }

  return (
    <>
      <h1 className="page-title">Reports</h1>
      <p className="panel-sub">Pick a period, preview it, then export for management.</p>

      <section className="panel">
        <div className="report-controls">
          <label>From<input type="date" value={from} onChange={(e) => edit(setFrom)(e.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(e) => edit(setTo)(e.target.value)} /></label>
          <div>
            <small className="muted">Quick range</small>
            <div className="preset-row">
              <button onClick={() => preset('7')}>Last 7 days</button>
              <button onClick={() => preset('30')}>Last 30 days</button>
              <button onClick={() => preset('month')}>This month</button>
            </div>
          </div>
          <div>
            <small className="muted">Bins</small>
            <div className="seg">
              {[['both', 'Both'], ['dry', 'Dry'], ['wet', 'Wet']].map(([k, l]) => (
                <button key={k} className={kind === k ? 'on' : ''} onClick={() => edit(setKind)(k)}>{l}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={generate} disabled={busy}>
            {busy ? 'Building…' : 'Generate report'}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </section>

      {report && (
        <>
          <div className="sum-row">
            <div className="card"><span>Total collections</span><b>{report.totals.collections}</b></div>
            <div className="card"><span>Total alerts</span><b>{report.totals.alerts}</b></div>
            <div className="card"><span>Bins included</span><b>{report.rows.length}</b></div>
          </div>

          {report.truncated && (
            <p className="form-error">Results were capped at 1000 rows. Use a shorter range for a complete report.</p>
          )}

          <div className="table-wrap">
            <table className="bin-table">
              <thead>
                <tr><th>Bin</th><th>Type</th><th>Collections</th><th>Alerts</th><th>Avg fill time</th><th>Sensor uptime</th></tr>
              </thead>
              <tbody>
                {report.rows.map((x) => (
                  <tr key={x.bin}>
                    <td><b>{x.bin}</b></td>
                    <td>{x.type}</td>
                    <td>{x.collections}</td>
                    <td>{x.alerts}</td>
                    <td>{fmtHours(x.avgFillHours)}</td>
                    <td>{x.uptimePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="th-actions">
            <button className="btn-primary" onClick={downloadPDF} disabled={pdfBusy}>
              <FileDown size={16} /> {pdfBusy ? 'Preparing…' : 'Download PDF'}
            </button>
            <button className="report-btn" onClick={() => exportCSV(report)}>
              <FileSpreadsheet size={16} /> Download CSV
            </button>
          </div>

          <p className="def-note">
            <b>Avg fill time</b> = hours from a pickup to the next "bin full" alert.
            <b> Sensor uptime</b> = share of hours in the period with at least one reading.
            The files also include the full alert history ({report.alertLog.length} entries).
          </p>
        </>
      )}
    </>
  )
}