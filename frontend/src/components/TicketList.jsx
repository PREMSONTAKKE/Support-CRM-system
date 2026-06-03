import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDateTime } from '../utils/format'

export default function TicketList({ tickets, loading }) {
  if (loading) {
    return <div className="state state--loading">Loading tickets…</div>
  }

  if (!tickets || tickets.length === 0) {
    return <div className="state state--empty">No tickets match your filters.</div>
  }

  return (
    <>
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ticket_id}>
              <td>
                <Link to={`/tickets/${t.ticket_id}`} className="ticket-id-link">
                  {t.ticket_id}
                </Link>
              </td>
              <td>{t.customer_name}</td>
              <td className="ticket-subject">{t.subject}</td>
              <td><StatusBadge status={t.status} /></td>
              <td className="ticket-date">{formatDateTime(t.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ticket-cards">
        {tickets.map((t) => (
          <Link to={`/tickets/${t.ticket_id}`} key={t.ticket_id} className="ticket-card">
            <div className="ticket-card__head">
              <span className="ticket-id-link">{t.ticket_id}</span>
              <StatusBadge status={t.status} />
            </div>
            <div className="ticket-card__name">{t.customer_name}</div>
            <div className="ticket-card__subject">{t.subject}</div>
            <div className="ticket-card__date">{formatDateTime(t.created_at)}</div>
          </Link>
        ))}
      </div>
    </>
  )
}
