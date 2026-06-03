const VARIANT = {
  Open: 'badge badge--open',
  'In Progress': 'badge badge--progress',
  Closed: 'badge badge--closed'
}

export default function StatusBadge({ status }) {
  const cls = VARIANT[status] || 'badge badge--unknown'
  return <span className={cls}>{status || 'Unknown'}</span>
}
