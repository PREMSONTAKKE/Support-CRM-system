import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import StatusFilter from '../components/StatusFilter'
import TicketList from '../components/TicketList'
import { listTickets } from '../api/tickets'

const DEBOUNCE_MS = 300

export default function Dashboard() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchTerm(searchInput.trim()), DEBOUNCE_MS)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await listTickets({
          status: statusFilter || undefined,
          search: searchTerm || undefined
        })
        if (!cancelled) setTickets(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load tickets')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [statusFilter, searchTerm])

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Tickets</h1>
          <p className="page__subtitle">
            {loading ? 'Loading…' : `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link to="/create" className="btn btn--primary">+ New Ticket</Link>
      </header>

      <div className="toolbar">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {error ? (
        <div className="state state--error">{error}</div>
      ) : (
        <TicketList tickets={tickets} loading={loading} />
      )}
    </div>
  )
}
