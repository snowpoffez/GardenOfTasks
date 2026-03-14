import { User, CurrencyDollar } from '@phosphor-icons/react'

const PAGES = { greenhouse: 'greenhouse', garden: 'garden', arboretum: 'arboretum' }

export default function Header({ stats, currentPage, onNavigate }) {
  const { gold } = stats ?? {}

  return (
    <header className="flex flex-col">
      <div className="navbar flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="navbar-brand whitespace-nowrap">&gt; Garden of Tasks</span>
          <nav className="navbar-nav">
            <button
              type="button"
              className={`navbar-link ${currentPage === PAGES.greenhouse ? 'navbar-link-active' : ''}`}
              onClick={() => onNavigate(PAGES.greenhouse)}
            >
              The Greenhouse
            </button>
            <button
              type="button"
              className={`navbar-link ${currentPage === PAGES.garden ? 'navbar-link-active' : ''}`}
              onClick={() => onNavigate(PAGES.garden)}
            >
              The Garden
            </button>
            <button
              type="button"
              className={`navbar-link ${currentPage === PAGES.arboretum ? 'navbar-link-active' : ''}`}
              onClick={() => onNavigate(PAGES.arboretum)}
            >
              The Arboretum
            </button>
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
