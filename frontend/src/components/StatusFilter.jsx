const TABS = [
  { value: '', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Closed', label: 'Closed' }
]

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="status-filter" role="tablist" aria-label="Filter by status">
      {TABS.map((tab) => (
        <button
          key={tab.value || 'all'}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={`status-filter__tab ${value === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
