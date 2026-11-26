import { supabase } from './supabase'
import { ALERT_META } from '../utils/thresholds'
import { demoReportData } from '../utils/demoReport'

const CAP = 1000          // Supabase returns at most 1000 rows per request by default
const KIND_LABEL = { both: 'Wet + Dry', wet: 'Wet bins', dry: 'Dry bins' }

const must = (res) => {
  if (res.error) throw new Error(res.error.message)
  return res.data ?? []
}

/* ---------- 1. fetch raw rows ---------- */
export async function fetchReportData({ from, to }) {
  if (!supabase) return demoReportData({ from, to })
  const f = from.toISOString()
  const t = to.toISOString()

  const [bins, collections, alerts, uptime] = await Promise.all([
    supabase.from('bins').select('id, name, kind').then(must),
    supabase.from('collections')
      .select('bin_id, collected_at, field_worker:workers(name)')
      .gte('collected_at', f).lte('collected_at', t)
      .order('collected_at').limit(CAP).then(must),
    supabase.from('alerts')
      .select(`bin_id, type, created_at, resolved_at,
               assigned:workers!assigned_worker_id(name),
               acked:workers!acknowledged_worker_id(name)`)
      .gte('created_at', f).lte('created_at', t)
      .order('created_at').limit(CAP).then(must),
    supabase.rpc('bin_uptime', { p_from: f, p_to: t }).then(must),
  ])

  return { bins, collections, alerts, uptime, truncated: collections.length >= CAP || alerts.length >= CAP }
}

/* ---------- 2. turn rows into the report ---------- */
export function buildReport(data, { from, to, kind }) {
  const picked = data.bins.filter((b) => kind === 'both' || (b.kind ?? 'dry') === kind)
  const ids = new Set(picked.map((b) => b.id))
  const nameOf = Object.fromEntries(data.bins.map((b) => [b.id, b.name]))
  const cols = data.collections.filter((c) => ids.has(c.bin_id))
  const als = data.alerts.filter((a) => ids.has(a.bin_id))

  const end = Math.min(to.getTime(), Date.now())
  const hoursTotal = Math.max(1, Math.ceil((end - from.getTime()) / 3600000))
  const upMap = Object.fromEntries(data.uptime.map((u) => [u.bin_id, u.hours_up]))

  const rows = picked.map((b) => {
    const bc = cols
      .filter((c) => c.bin_id === b.id)
      .sort((a, z) => new Date(a.collected_at) - new Date(z.collected_at))
    const ba = als.filter((a) => a.bin_id === b.id)

    // fill time = hours from a pickup to the next "full" alert
    const gaps = []
    ba.filter((a) => a.type === 'full').forEach((a) => {
      const t = new Date(a.created_at).getTime()
      const prev = [...bc].reverse().find((c) => new Date(c.collected_at).getTime() <= t)
      if (prev) gaps.push((t - new Date(prev.collected_at).getTime()) / 3600000)
    })

    return {
      bin: b.name,
      type: (b.kind ?? 'dry') === 'wet' ? 'Wet' : 'Dry',
      collections: bc.length,
      alerts: ba.length,
      avgFillHours: gaps.length ? gaps.reduce((s, x) => s + x, 0) / gaps.length : null,
      uptimePct: Math.min(100, Math.round(((upMap[b.id] ?? 0) / hoursTotal) * 100)),
    }
  })

  const byType = {}
  als.forEach((a) => { byType[a.type] = (byType[a.type] ?? 0) + 1 })

  const alertLog = [...als]
    .sort((a, z) => new Date(z.created_at) - new Date(a.created_at))
    .map((a) => ({
      when: new Date(a.created_at),
      bin: nameOf[a.bin_id] ?? a.bin_id,
      type: ALERT_META[a.type]?.label ?? a.type,
      assigned: a.assigned?.name ?? '--',
      acked: a.acked?.name ?? '--',
      resolved: a.resolved_at ? new Date(a.resolved_at) : null,
    }))

  return {
    from, to, kind, generatedAt: new Date(), rows, alertLog, byType,
    totals: { collections: cols.length, alerts: als.length },
    truncated: data.truncated,
  }
}

/* ---------- 3. formatting ---------- */
const dt = (d) => d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
const day = (d) => d.toLocaleDateString('en-IN', { dateStyle: 'medium' })
export const fmtHours = (h) => (h == null ? '--' : h < 1 ? '<1 h' : `${h.toFixed(1)} h`)
export const kindLabel = (k) => KIND_LABEL[k]
const fileName = (r, ext) =>
  `smartbin-report_${r.from.toLocaleDateString('en-CA')}_to_${r.to.toLocaleDateString('en-CA')}_${r.kind}.${ext}`

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- 4. CSV ---------- */
const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCSV(r) {
  const line = (a) => a.map(esc).join(',')
  const out = [
    line(['SmartBin report']),
    line(['Period', `${day(r.from)} to ${day(r.to)}`]),
    line(['Bins', KIND_LABEL[r.kind]]),
    line(['Generated', dt(r.generatedAt)]),
    line(['Total collections', r.totals.collections]),
    line(['Total alerts', r.totals.alerts]),
    '',
    line(['Bin summary']),
    line(['Bin', 'Type', 'Collections', 'Alerts', 'Avg fill time (h)', 'Sensor uptime (%)']),
    ...r.rows.map((x) => line([x.bin, x.type, x.collections, x.alerts,
      x.avgFillHours == null ? '' : x.avgFillHours.toFixed(1), x.uptimePct])),
    '',
    line(['Alert history']),
    line(['When', 'Bin', 'Alert', 'Assigned to', 'Acknowledged by', 'Resolved']),
    ...r.alertLog.map((x) => line([dt(x.when), x.bin, x.type, x.assigned, x.acked,
      x.resolved ? dt(x.resolved) : 'Open'])),
  ]
  // the BOM makes Excel read the file as UTF-8
  download(new Blob(['\ufeff' + out.join('\r\n')], { type: 'text/csv;charset=utf-8' }), fileName(r, 'csv'))
}

/* ---------- 5. PDF ---------- */
export async function exportPDF(r) {
  const { jsPDF } = await import('jspdf')                       // loaded only when needed
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const purple = [124, 58, 237]

  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)
  doc.text('SmartBin report', 40, 48)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Period: ${day(r.from)} to ${day(r.to)}   |   Bins: ${KIND_LABEL[r.kind]}`, 40, 66)
  doc.text(`Generated: ${dt(r.generatedAt)}`, 40, 80)

  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text(`Total collections: ${r.totals.collections}      Total alerts: ${r.totals.alerts}`, 40, 104)

  autoTable(doc, {
    startY: 116,
    head: [['Bin', 'Type', 'Collections', 'Alerts', 'Avg fill time', 'Sensor uptime']],
    body: r.rows.map((x) => [x.bin, x.type, x.collections, x.alerts, fmtHours(x.avgFillHours), `${x.uptimePct}%`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: purple },
  })

  const y = (doc.lastAutoTable?.finalY ?? 200) + 28
  doc.setFontSize(12)
  doc.text('Alert history', 40, y)

  autoTable(doc, {
    startY: y + 8,
    head: [['When', 'Bin', 'Alert', 'Assigned to', 'Acknowledged by', 'Resolved']],
    body: r.alertLog.length
      ? r.alertLog.map((x) => [dt(x.when), x.bin, x.type, x.assigned, x.acked, x.resolved ? dt(x.resolved) : 'Open'])
      : [['No alerts in this period', '', '', '', '', '']],
    styles: { fontSize: 8 },
    headStyles: { fillColor: purple },
  })

  if (r.truncated) {
    doc.setFontSize(9)
    doc.setTextColor(185, 28, 28)
    doc.text('Note: results were capped at 1000 rows. Use a shorter date range for a complete report.', 40, doc.internal.pageSize.height - 30)
  }

  doc.save(fileName(r, 'pdf'))
}