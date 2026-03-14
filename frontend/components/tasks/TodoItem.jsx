import { Check, Calendar } from '@phosphor-icons/react'

export default function TodoItem({ todo, onToggle, onEdit }) {
  const accentClass = `accent-${todo.accentColor || 'green-500'}`
  return (
    <div
      className="flex rounded-lg shadow-md overflow-hidden min-h-[72px]"
      style={{ backgroundColor: 'var(--col-bg-card)', borderWidth: '1px', borderColor: 'var(--col-border)' }}
    >
      <div className={`w-12 shrink-0 ${accentClass} flex items-center justify-center py-3 ${todo.completed ? 'accent-completed' : ''}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(todo.id) }}
          className={`flex items-center justify-center shrink-0 cursor-pointer ${todo.completed ? 'w-7 h-7 rounded-full shadow-sm' : 'w-7 h-7 rounded border border-white bg-white/80'}`}
          style={todo.completed ? { backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-heading)' } : {}}
          aria-label={todo.completed ? 'Completed' : 'Mark complete'}
        >
          {todo.completed ? <Check size={14} weight="bold" /> : null}
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onEdit?.(todo.id)}
        onKeyDown={(e) => e.key === 'Enter' && onEdit?.(todo.id)}
        className="flex-1 flex flex-col justify-between px-3 py-2 min-h-[72px] cursor-pointer card-hover min-w-0"
      >
        <div className="min-w-0">
          <div
            className={`text-sm font-semibold truncate ${todo.completed ? 'line-through' : ''}`}
            style={{ color: todo.completed ? 'var(--col-text-completed)' : 'var(--col-text-heading)' }}
          >
            {todo.title || 'Untitled task'}
          </div>
          {todo.notes?.trim() && (
            <p className={`text-xs mt-0.5 line-clamp-2 ${todo.completed ? 'line-through' : ''}`} style={{ color: 'var(--col-text-muted)' }}>
              {todo.notes.trim()}
            </p>
          )}
        </div>
        {todo.dueDate?.trim() && (
          <div className="flex items-center gap-1 mt-1.5 text-xs shrink-0" style={{ color: 'var(--col-text-muted)' }}>
            <Calendar size={12} className="shrink-0" aria-hidden />
            <span className="truncate">Due {todo.dueDate.trim()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
