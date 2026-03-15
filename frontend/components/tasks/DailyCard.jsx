import { useState, useEffect } from 'react'
import { CheckIcon, FlameIcon, CalendarIcon } from '@phosphor-icons/react'

export default function DailyCard({ daily, onToggle, onEdit }) {
  const accentClass = `accent-${daily.accentColor || 'green-500'}`
  const [justCompleted, setJustCompleted] = useState(false)
  useEffect(() => {
    if (daily.checked) {
      setJustCompleted(true)
      const t = setTimeout(() => setJustCompleted(false), 500)
      return () => clearTimeout(t)
    }
  }, [daily.checked])
  return (
    <div
      className={`task-card task-card-breathe flex rounded-lg overflow-hidden min-h-[72px] ${daily.checked ? 'task-card-completed' : ''} ${justCompleted ? 'task-card-spell' : ''}`}
      style={{ backgroundColor: 'var(--col-bg-card)' }}
    >
      <div className={`w-12 shrink-0 ${accentClass} flex items-center justify-center py-3 ${daily.checked ? 'accent-completed' : ''}`}>
        <button
          type="button"
          onClick={() => onToggle(daily.id)}
          className={`flex items-center justify-center shrink-0 ${daily.checked ? 'w-7 h-7 rounded-full shadow-sm' : 'w-7 h-7 rounded border border-white bg-white/80'}`}
          style={daily.checked ? { backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-heading)' } : {}}
          aria-label={daily.checked ? 'Checked' : 'Unchecked'}
        >
          {daily.checked ? <CheckIcon size={14} weight="bold" /> : null}
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onEdit?.(daily.id)}
        onKeyDown={(e) => e.key === 'Enter' && onEdit?.(daily.id)}
        className="flex-1 flex flex-col justify-between px-3 py-2 min-h-[72px] cursor-pointer card-hover min-w-0"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--col-text-heading)' }}>
            {daily.title || 'Untitled daily'}
          </div>
          {daily.notes?.trim() && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--col-text-muted)' }}>
              {daily.notes.trim()}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1.5 text-xs shrink-0" style={{ color: 'var(--col-text-muted)' }}>
          <span className="flex items-center gap-1 min-w-0">
            {daily.dueDate?.trim() && (
              <>
                <CalendarIcon size={12} className="shrink-0" aria-hidden />
                <span className="truncate">Due {daily.dueDate.trim()}</span>
              </>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <FlameIcon size={12} aria-hidden />
            <span>{daily.count}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
