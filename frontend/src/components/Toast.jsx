export default function Toast({ message, kind = 'success', onClose }) {
  if (!message) return null
  return (
    <div className={`toast toast--${kind}`} role="status">
      <span>{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  )
}
