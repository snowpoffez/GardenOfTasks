import { Flame, ArrowCounterClockwise, Plus, Check } from '@phosphor-icons/react'

function DailyCard({ daily, onToggle }) {
  return (
    <div
      className="flex rounded-lg shadow-md overflow-hidden min-h-[72px]"
      style={{ backgroundColor: 'var(--col-bg-card)', borderWidth: '1px', borderColor: 'var(--col-border)' }}
    >
      <div className={`w-12 shrink-0 ${daily.stripColor} flex items-center justify-center py-3`}>
        <button
          type="button"
          onClick={() => onToggle(daily.id)}
          className={`flex items-center justify-center shrink-0 ${daily.checked ? 'w-7 h-7 rounded-full shadow-sm' : 'w-7 h-7 rounded border border-white bg-white/80'}`}
          style={daily.checked ? { backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-heading)' } : {}}
          aria-label={daily.checked ? 'Checked' : 'Unchecked'}
        >
          {daily.checked ? <Check size={14} weight="bold" /> : null}
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-end px-3 py-2 min-h-[72px]">
        <span className="text-sm" style={{ color: 'var(--col-text-body)' }}>
          {daily.title || '\u00A0'}
        </span>
        <div className="flex items-center justify-end gap-1 text-xs mt-1" style={{ color: 'var(--col-text-muted)' }}>
          <Flame size={12} className="shrink-0" />
          <span>{daily.count}</span>
        </div>
      </div>
    </div>
  )
}

function TodoItem({ todo, onToggle }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(todo.id)}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(todo.id)}
      className="flex items-center gap-3 p-3 rounded-lg shadow-md cursor-pointer card-hover"
      style={{
        backgroundColor: 'var(--col-bg-card)',
        borderWidth: '1px',
        borderColor: 'var(--col-border)',
      }}
    >
      <div
        className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${todo.completed ? '' : 'border-2'}`}
        style={
          todo.completed
            ? { backgroundColor: 'var(--col-checkbox-checked)', color: 'var(--col-accent-foreground)' }
            : { borderColor: 'var(--col-checkbox-unchecked)' }
        }
      >
        {todo.completed ? <Check size={14} weight="bold" /> : null}
      </div>
      <span
        className={`text-sm flex-1 ${todo.completed ? 'line-through' : ''}`}
        style={{ color: todo.completed ? 'var(--col-text-completed)' : 'var(--col-text-body)' }}
      >
        {todo.title}
      </span>
    </div>
  )
}

export default function TasksPage({
  dailies,
  todos,
  todoTab,
  setTodoTab,
  activeTodoCount,
  incompleteDailyCount,
  onDailyToggle,
  onAddTodo,
  onTodoToggle,
  onUndo,
  canUndo,
}) {
  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)
  const displayedTodos = todoTab === 'active' ? activeTodos : completedTodos

  return (
    <div
      className="flex-1 min-h-0 flex flex-col"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      <div className="flex justify-end gap-2 pt-5 pb-2 pr-20">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow ${canUndo ? 'btn-accent' : 'btn-disabled cursor-not-allowed'}`}
        >
          <ArrowCounterClockwise size={18} weight="bold" />
          Undo
        </button>
        <button
          type="button"
          onClick={onAddTodo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow btn-accent"
        >
          <Plus size={20} weight="bold" />
          Add Task
        </button>
      </div>

      <div className="flex flex-1 justify-center px-20 pb-6 min-h-0">
        <div className="w-5/6 flex gap-8 min-h-0">
          <section className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold" style={{ color: 'var(--col-text-heading)' }}>
                Dailies
              </h2>
              <span
                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                style={{ backgroundColor: 'var(--col-accent)' }}
              >
                {incompleteDailyCount}
              </span>
            </div>
            <div className="space-y-3">
              {dailies.map((d) => (
                <DailyCard key={d.id} daily={d} onToggle={onDailyToggle} />
              ))}
            </div>
          </section>

          <section className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold" style={{ color: 'var(--col-text-heading)' }}>
                To Do&apos;s
              </h2>
              <span
                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                style={{ backgroundColor: 'var(--col-accent)' }}
              >
                {activeTodoCount}
              </span>
            </div>
            <div
              className="flex gap-6 border-b mb-3 pt-1"
              style={{ borderColor: 'var(--col-tab-border)' }}
            >
              <button
                type="button"
                onClick={() => setTodoTab('active')}
                className="pb-2 text-sm font-medium border-b-2"
                style={
                  todoTab === 'active'
                    ? { color: 'var(--col-accent-hover)', borderColor: 'var(--col-accent)' }
                    : { color: 'var(--col-tab-inactive)', borderColor: 'transparent' }
                }
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setTodoTab('completed')}
                className="pb-2 text-sm font-medium border-b-2"
                style={
                  todoTab === 'completed'
                    ? { color: 'var(--col-accent-hover)', borderColor: 'var(--col-accent)' }
                    : { color: 'var(--col-tab-inactive)', borderColor: 'transparent' }
                }
              >
                Completed
              </button>
            </div>
            <div className="flex-1 min-h-[160px] overflow-auto">
              {displayedTodos.length === 0 ? (
                <div
                  className="min-h-[160px] rounded-lg mt-1"
                  style={{ backgroundColor: 'var(--col-bg-empty)' }}
                />
              ) : (
                <div className="space-y-2 mt-1">
                  {displayedTodos.map((t) => (
                    <TodoItem key={t.id} todo={t} onToggle={onTodoToggle} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
