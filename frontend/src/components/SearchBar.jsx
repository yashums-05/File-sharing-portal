import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search files...' }) {
  return (
    <div className="search-wrapper">
      <FiSearch className="search-icon" />
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search files"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Clear search"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  )
}
