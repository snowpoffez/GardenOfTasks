import { useState, useRef, useEffect } from 'react'
import { UserIcon, CurrencyDollarIcon, CaretDownIcon, UserCircleIcon, GearIcon, SignOutIcon } from '@phosphor-icons/react'
import { formatCoins } from '../constants/garden'

const PAGES = {
  greenhouse: 'greenhouse',
  garden: 'garden',
  arboretum: 'arboretum',
  profile: 'profile',
  settings: 'settings',
}

export default function Header({ user, stats, currentPage, onNavigate, onLogout }) {
  const { level = 1, xp = 0, maxXp = 100, gold } = stats ?? {}
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleNav = (page) => {
    setDropdownOpen(false)
    onNavigate(page)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    onLogout?.()
  }

  const xpPct = maxXp > 0 ? Math.min(100, (xp / maxXp) * 100) : 0

  return (
    <header className="flex flex-col">
      <div className="navbar flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-8">
          <span className="navbar-brand flex items-center gap-2.5 whitespace-nowrap">
            <span className="navbar-logo" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 6c-4 4-8 8-8 14 0 4 3 6 6 6 2 0 4-1 6-3 2 2 4 3 6 3 3 0 6-2 6-6 0-6-4-10-8-14z" fill="currentColor" opacity="0.92"/>
                <path d="M16 6c4 4 8 8 8 14 0 4-3 6-6 6-2 0-4-1-6-3-2 2-4 3-6 3-3 0-6-2-6-6 0-6 4-10 8-14z" fill="currentColor" opacity="0.85"/>
              </svg>
            </span>
            Garden of Tasks
          </span>
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
          <span className="navbar-stat" title={`Level ${level} · ${xp}/${maxXp} XP`}>
            <span className="font-semibold">Lv.{level}</span>
            <span className="navbar-stat-xp">
              <span className="navbar-stat-xp-fill" style={{ width: `${xpPct}%` }} />
              <span className="navbar-stat-xp-text">{xp}/{maxXp}</span>
            </span>
          </span>
          <span className="navbar-gold">
            <CurrencyDollarIcon size={18} weight="bold" />
            {gold != null ? formatCoins(gold, 3) : '—'}
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className={`navbar-profile ${dropdownOpen ? 'navbar-profile-open' : ''}`}
              aria-label="Profile menu"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <UserIcon size={20} />
              <CaretDownIcon size={14} className="ml-0.5 opacity-80" />
            </button>
            {dropdownOpen && (
              <div className="navbar-dropdown">
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => handleNav(PAGES.profile)}
                >
                  <UserCircleIcon size={18} />
                  Profile
                </button>
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => handleNav(PAGES.settings)}
                >
                  <GearIcon size={18} />
                  Settings
                </button>
                <hr className="navbar-dropdown-divider" />
                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-item-danger"
                  onClick={handleLogout}
                >
                  <SignOutIcon size={18} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
