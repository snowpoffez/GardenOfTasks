import { User, CurrencyDollar } from '@phosphor-icons/react'

export default function Header({ stats }) {
  const { gold } = stats ?? {}

  return (
    <header className="flex flex-col">
      <div className="navbar flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="navbar-brand whitespace-nowrap">&gt; Garden of Tasks</span>
          <nav className="navbar-nav">
            <span className="navbar-link navbar-link-active">The Greenhouse</span>
            <span className="navbar-link">The Garden</span>
            <span className="navbar-link">The Arboretum</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="navbar-gold">
            <CurrencyDollar size={18} weight="bold" />
            {gold != null ? gold : '—'}
          </span>
          <button
            type="button"
            className="navbar-profile"
            aria-label="Profile"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
