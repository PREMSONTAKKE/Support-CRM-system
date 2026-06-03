const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })

  if (!res.ok) {
    let detail
    try {
      const body = await res.json()
      detail = body.detail
      if (Array.isArray(detail)) {
        detail = detail.map((d) => d.msg).join('; ')
      }
    } catch {
      detail = res.statusText
    }
    const err = new Error(detail || `Request failed: ${res.status}`)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const listTickets = ({ status, search } = {}) => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  const qs = params.toString()
  return request(`/api/tickets${qs ? `?${qs}` : ''}`)
}

export const getTicket = (ticketId) => request(`/api/tickets/${ticketId}`)

export const createTicket = (payload) =>
  request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) })

export const updateTicket = (ticketId, payload) =>
  request(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify(payload) })
