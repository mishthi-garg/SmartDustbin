export default function AlertBadge({ count, urgent }) {
  if (!count) return null
  return <span className={`alert-badge ${urgent ? 'urgent' : ''}`}>{count}</span>
}