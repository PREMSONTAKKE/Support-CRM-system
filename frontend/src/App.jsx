import { Link, NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="topnav">
        <Link to="/" className="topnav__brand">

          <span>Support CRM</span>
        </Link>
        <nav className="topnav__links">
          <NavLink to="/" end className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}>
            New Ticket
          </NavLink>
        </nav>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTicket />} />
          <Route path="/tickets/:ticket_id" element={<TicketDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app__footer">
        <span>Support CRM</span>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <div className="page">
      <div className="state">Page not found.</div>
    </div>
  )
}
