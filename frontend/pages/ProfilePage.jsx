import { UserCircleIcon, LeafIcon, CurrencyDollarIcon, StarIcon } from '@phosphor-icons/react'
import { formatCoins } from '../constants/garden'

export default function ProfilePage({ user, stats }) {
  const username = user?.username ?? 'Gardener'
  const { level = 1, xp = 0, maxXp = 100, gold = 0 } = stats ?? {}
  const xpPct = maxXp > 0 ? Math.min(100, (xp / maxXp) * 100) : 0

  return (
    <div
      className="flex-1 overflow-auto"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      <div className="max-w-xl mx-auto px-6 py-10">
        <div
          className="rounded-2xl p-8 shadow-lg border"
          style={{
            backgroundColor: 'var(--col-bg-card)',
            borderColor: 'var(--col-border)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--col-green-200)' }}
            >
              <UserCircleIcon size={48} style={{ color: 'var(--col-green-700)' }} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--col-text-heading)' }}
              >
                {username}
              </h1>
              <p className="text-sm" style={{ color: 'var(--col-text-muted)' }}>
                Gardener · Level {level}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: 'var(--col-bg-page)',
                border: '1px solid var(--col-border-light)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--col-green-200)' }}
              >
                <LeafIcon size={22} style={{ color: 'var(--col-green-700)' }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--col-text-muted)' }}>
                  Level
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--col-text-heading)' }}>
                  {level}
                </p>
              </div>
            </div>
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: 'var(--col-bg-page)',
                border: '1px solid var(--col-border-light)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--col-green-200)' }}
              >
                <StarIcon size={22} style={{ color: 'var(--col-green-700)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--col-text-muted)' }}>
                  XP
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--col-text-heading)' }}>
                  {xp} / {maxXp}
                </p>
                <div
                  className="mt-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--col-border)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${xpPct}%`,
                      backgroundColor: 'var(--col-green-500)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: 'var(--col-bg-page)',
                border: '1px solid var(--col-border-light)',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--col-green-200)' }}
              >
                <CurrencyDollarIcon size={22} style={{ color: 'var(--col-green-700)' }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--col-text-muted)' }}>
                  Coins
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--col-text-heading)' }}>
                  {formatCoins(gold, 3)}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-center" style={{ color: 'var(--col-text-muted)' }}>
            Keep tending your tasks to grow your garden and level up.
          </p>
        </div>
      </div>
    </div>
  )
}
