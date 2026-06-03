import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { getTicket, updateTicket } from '../api/tickets'
import { formatDateTime } from '../utils/format'

const STATUSES = ['Open', 'In Progress', 'Closed']

export default function TicketDetail() {
  const { ticket_id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getTicket(ticket_id)
      setTicket(data)
    } catch (err) {
      setLoadError(err.message || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }, [ticket_id])

  useEffect(() => { refresh() }, [refresh])

  const onStatusChange = async (e) => {
    const newStatus = e.target.value
    if (!ticket || newStatus === ticket.status) return
    const previous = ticket.status
    setTicket((t) => ({ ...t, status: newStatus }))
    try {
      const res = await updateTicket(ticket_id, { status: newStatus })
      setTicket((t) => ({ ...t, updated_at: res.updated_at }))
      showToast(`Status changed to “${newStatus}”`)
    } catch (err) {
      setTicket((t) => ({ ...t, status: previous }))
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  const onAddNote = async (e) => {
    e.preventDefault()
    const text = noteDraft.trim()
    if (!text) return
    setSubmittingNote(true)
    try {
      await updateTicket(ticket_id, { notes: text })
      setNoteDraft('')
      showToast('Note added')
      await refresh()
    } catch (err) {
      showToast(err.message || 'Failed to add note', 'error')
    } finally {
      setSubmittingNote(false)
    }
  }

  if (loading) return <div className="state state--loading">Loading ticket…</div>
  if (loadError) {
    return (
      <div className="page page--narrow">
        <div className="state state--error">{loadError}</div>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>← Back to tickets</button>
      </div>
    )
  }
  if (!ticket) return null

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <div>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => navigate('/')}>
            ← All tickets
          </button>
          <h1 className="page__title">{ticket.subject}</h1>
          <p className="page__subtitle">
            <span className="ticket-id-link">{ticket.ticket_id}</span>
            <span className="dot">·</span>
            Created {formatDateTime(ticket.created_at)}
            <span className="dot">·</span>
            Updated {formatDateTime(ticket.updated_at)}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </header>

      <section className="card">
        <h2 className="card__title">Customer</h2>
        <div className="kv"><span>Name</span><strong>{ticket.customer_name}</strong></div>
        <div className="kv"><span>Email</span><strong>{ticket.customer_email}</strong></div>
      </section>

      <section className="card">
        <h2 className="card__title">Description</h2>
        <p className="card__body">{ticket.description}</p>
      </section>

      <section className="card">
        <h2 className="card__title">Status</h2>
        <select
          className="form__input"
          value={ticket.status}
          onChange={onStatusChange}
          aria-label="Update ticket status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2 className="card__title">Notes ({ticket.notes.length})</h2>
        {ticket.notes.length === 0 ? (
          <p className="card__muted">No notes yet.</p>
        ) : (
          <ul className="notes">
            {ticket.notes.map((n, i) => (
              <li key={i} className="note">
                <div className="note__body">{n.note_text}</div>
                <div className="note__time">{formatDateTime(n.created_at)}</div>
              </li>
            ))}
          </ul>
        )}

        <form className="note-form" onSubmit={onAddNote}>
          <textarea
            rows={3}
            className="form__input form__textarea"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Write a new note…"
            disabled={submittingNote}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submittingNote || !noteDraft.trim()}
          >
            {submittingNote ? 'Adding…' : 'Add Note'}
          </button>
        </form>
      </section>

      <Toast
        message={toast?.message}
        kind={toast?.kind}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
