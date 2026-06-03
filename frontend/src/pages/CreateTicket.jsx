import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../api/tickets'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initial = {
  customer_name: '',
  customer_email: '',
  subject: '',
  description: ''
}

export default function CreateTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Name is required'
    if (!form.customer_email.trim()) e.customer_email = 'Email is required'
    else if (!EMAIL_RE.test(form.customer_email.trim())) e.customer_email = 'Enter a valid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setServerError('')
    try {
      const res = await createTicket({
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        subject: form.subject.trim(),
        description: form.description.trim()
      })
      navigate(`/tickets/${res.ticket_id}`)
    } catch (err) {
      setServerError(err.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <div>
          <h1 className="page__title">New Ticket</h1>
          <p className="page__subtitle">Ticket ID and timestamp are generated automatically.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => navigate('/')}>← Back</button>
      </header>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form__row">
          <label className="form__label" htmlFor="customer_name">Customer name</label>
          <input
            id="customer_name"
            className={`form__input ${errors.customer_name ? 'is-invalid' : ''}`}
            value={form.customer_name}
            onChange={onChange('customer_name')}
            placeholder="e.g. Jane Doe"
            autoComplete="name"
          />
          {errors.customer_name && <span className="form__error">{errors.customer_name}</span>}
        </div>

        <div className="form__row">
          <label className="form__label" htmlFor="customer_email">Customer email</label>
          <input
            id="customer_email"
            type="email"
            className={`form__input ${errors.customer_email ? 'is-invalid' : ''}`}
            value={form.customer_email}
            onChange={onChange('customer_email')}
            placeholder="jane@example.com"
            autoComplete="email"
          />
          {errors.customer_email && <span className="form__error">{errors.customer_email}</span>}
        </div>

        <div className="form__row">
          <label className="form__label" htmlFor="subject">Subject</label>
          <input
            id="subject"
            className={`form__input ${errors.subject ? 'is-invalid' : ''}`}
            value={form.subject}
            onChange={onChange('subject')}
            placeholder="Brief summary of the issue"
          />
          {errors.subject && <span className="form__error">{errors.subject}</span>}
        </div>

        <div className="form__row">
          <label className="form__label" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={6}
            className={`form__input form__textarea ${errors.description ? 'is-invalid' : ''}`}
            value={form.description}
            onChange={onChange('description')}
            placeholder="Provide as much detail as possible…"
          />
          {errors.description && <span className="form__error">{errors.description}</span>}
        </div>

        {serverError && <div className="state state--error">{serverError}</div>}

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/')} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
