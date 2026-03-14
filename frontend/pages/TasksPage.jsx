import { useState } from 'react'
import { Flame, ArrowCounterClockwise, Plus, Check, Star, Calendar, Trash, CaretDown } from '@phosphor-icons/react'

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

function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className={i < value ? 'filled' : ''}
          aria-label={`${i + 1} of ${max}`}
        >
          <Star size={24} weight={i < value ? 'fill' : 'regular'} />
        </button>
      ))}
    </div>
  )
}

function AddTaskPickModal({ onPickDaily, onPickTodo, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '20rem' }}>
        <div className="modal-header">
          <span className="font-semibold">Add task</span>
        </div>
        <div className="modal-body flex flex-col gap-2">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg text-left font-medium btn-accent"
            onClick={onPickDaily}
          >
            Dailies
          </button>
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg text-left font-medium btn-accent"
            onClick={onPickTodo}
          >
            To Do&apos;s
          </button>
        </div>
      </div>
    </div>
  )
}

function TodoFormModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [rewardAmount, setRewardAmount] = useState(3)
  const [damageAmount, setDamageAmount] = useState(3)
  const [dueDate, setDueDate] = useState('')
  const [checklistItems, setChecklistItems] = useState([])
  const [checklistOpen, setChecklistOpen] = useState(true)

  const addChecklistItem = () => {
    setChecklistItems((prev) => [...prev, { id: `cl-${Date.now()}`, text: '' }])
  }

  const updateChecklistItem = (id, text) => {
    setChecklistItems((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)))
  }

  const handleSave = () => {
    onSave({
      title: title || 'New task',
      notes,
      rewardAmount,
      damageAmount,
      dueDate,
      checklistItems: checklistItems.filter((c) => c.text.trim()),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <span className="font-semibold">Edit To Do</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-sm font-medium opacity-90 hover:opacity-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded text-sm font-medium shadow"
              style={{ backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-body)' }}
            >
              Save
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Notes</label>
            <textarea
              className="modal-input modal-textarea"
              placeholder="Enter notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Reward Amount</label>
            <StarRating value={rewardAmount} onChange={setRewardAmount} />
          </div>
          <div className="modal-field">
            <label>Damage Amount</label>
            <StarRating value={damageAmount} onChange={setDamageAmount} />
          </div>
          <div className="modal-field">
            <label>Due Date</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="modal-input flex-1"
                placeholder="yyyy-mm-dd"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Calendar size={20} style={{ color: 'var(--col-text-muted)' }} />
            </div>
          </div>
          <div className="modal-field">
            <button
              type="button"
              onClick={() => setChecklistOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium w-full"
              style={{ color: 'var(--col-text-body)' }}
            >
              Checklist
              <CaretDown size={16} className={checklistOpen ? 'rotate-180' : ''} />
            </button>
            {checklistOpen && (
              <div className="mt-2">
                {checklistItems.map((item) => (
                  <input
                    key={item.id}
                    type="text"
                    className="modal-input mb-2"
                    placeholder="Checklist item"
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                  />
                ))}
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="text-sm flex items-center gap-1"
                  style={{ color: 'var(--col-text-muted)' }}
                >
                  <Plus size={14} /> New checklist item
                </button>
              </div>
            )}
          </div>
          <button type="button" className="modal-delete" onClick={onClose}>
            <Trash size={16} />
            Delete this To Do
          </button>
        </div>
      </div>
    </div>
  )
}

const REPEAT_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly']

function DailyFormModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [rewardAmount, setRewardAmount] = useState(3)
  const [damageAmount, setDamageAmount] = useState(3)
  const [dueDate, setDueDate] = useState('')
  const [repeatInterval, setRepeatInterval] = useState('Daily')
  const [repeatEvery, setRepeatEvery] = useState(1)
  const unitByInterval = { Daily: 'day', Weekly: 'week', Monthly: 'month', Yearly: 'year' }
  const repeatUnit = unitByInterval[repeatInterval] || 'day'

  const handleSave = () => {
    onSave({
      title: title || 'New daily',
      notes,
      rewardAmount,
      damageAmount,
      dueDate,
      repeatInterval,
      repeatEvery,
      repeatUnit: unitByInterval[repeatInterval] || 'day',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <span className="font-semibold">Edit Daily</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-sm font-medium opacity-90 hover:opacity-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded text-sm font-medium shadow"
              style={{ backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-body)' }}
            >
              Save
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Notes</label>
            <textarea
              className="modal-input modal-textarea"
              placeholder="Enter notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Repeat Interval</label>
            <select
              className="modal-input"
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(e.target.value)}
            >
              {REPEAT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label>Repeat Every</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                className="modal-input w-20"
                value={repeatEvery}
                onChange={(e) => setRepeatEvery(Number(e.target.value) || 1)}
              />
              <span className="text-sm" style={{ color: 'var(--col-text-body)' }}>
                {repeatUnit}{repeatEvery !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="modal-field">
            <label>Reward Amount</label>
            <StarRating value={rewardAmount} onChange={setRewardAmount} />
          </div>
          <div className="modal-field">
            <label>Damage Amount</label>
            <StarRating value={damageAmount} onChange={setDamageAmount} />
          </div>
          <div className="modal-field">
            <label>Due Date</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="modal-input flex-1"
                placeholder="yyyy-mm-dd"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Calendar size={20} style={{ color: 'var(--col-text-muted)' }} />
            </div>
          </div>
        </div>
      </div>
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
  onOpenAddTask,
  onAddTodoWithData,
  onAddDailyWithData,
  onCloseAddTask,
  addTaskModal,
  onPickTodo,
  onPickDaily,
  onTodoToggle,
  onUndo,
  canUndo,
}) {
  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)
  const displayedTodos = todoTab === 'active' ? activeTodos : completedTodos

  return (
    <>
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{ backgroundColor: 'var(--col-bg-page)' }}
      >
        <div className="flex justify-end gap-2 pt-5 pb-2 pr-20">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow ${canUndo ? 'btn-accent' : 'btn-disabled'}`}
          >
            <ArrowCounterClockwise size={18} weight="bold" />
            Undo
          </button>
          <button
            type="button"
            onClick={onOpenAddTask}
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

      {addTaskModal === 'pick' && (
        <AddTaskPickModal
          onPickDaily={onPickDaily}
          onPickTodo={onPickTodo}
          onClose={onCloseAddTask}
        />
      )}
      {addTaskModal === 'todo' && (
        <TodoFormModal onSave={onAddTodoWithData} onClose={onCloseAddTask} />
      )}
      {addTaskModal === 'daily' && (
        <DailyFormModal onSave={onAddDailyWithData} onClose={onCloseAddTask} />
      )}
    </>
  )
}
