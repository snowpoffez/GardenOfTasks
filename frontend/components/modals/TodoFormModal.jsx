import { useState } from 'react'
import { PlusIcon, TrashIcon, CaretDownIcon } from '@phosphor-icons/react'
import StarRating from '../StarRating'

export default function TodoFormModal({ mode = 'add', initialData, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [value, setValue] = useState(initialData?.rewardAmount ?? initialData?.damageAmount ?? 3)
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '')
  const [subtasks, setSubtasks] = useState(
    initialData?.checklistItems?.length
      ? initialData.checklistItems.map((c) => ({ id: c.id || `st-${Date.now()}-${Math.random()}`, text: c.text ?? '' }))
      : []
  )
  const [subtasksOpen, setSubtasksOpen] = useState(true)

  const addSubtask = (text = '') => {
    setSubtasks((prev) => [...prev, { id: `st-${Date.now()}`, text }])
  }

  const updateSubtask = (id, text) => {
    setSubtasks((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)))
  }

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value.replace(/[^\d-]/g, '').slice(0, 10))
  }

  const handleSave = () => {
    onSave({
      title: title || 'New task',
      notes,
      rewardAmount: value,
      damageAmount: value,
      dueDate,
      checklistItems: subtasks.filter((c) => c.text.trim()),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <span className="font-semibold">{mode === 'add' ? 'Add To Do' : 'Edit To Do'}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-sm font-medium opacity-90 hover:opacity-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim()}
              className={`px-3 py-1.5 rounded text-sm font-medium shadow ${title.trim() ? '' : 'btn-disabled'}`}
              style={title.trim() ? { backgroundColor: 'var(--col-bg-card)', color: 'var(--col-text-body)' } : undefined}
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
              placeholder="Enter task title (required)"
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
            <label>Value</label>
            <StarRating value={value} onChange={setValue} />
          </div>
          <div className="modal-field">
            <label>Due Date</label>
            <input
              type="text"
              className="modal-input w-full"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChange={handleDueDateChange}
              maxLength={10}
            />
          </div>
          <div className="modal-field">
            <button
              type="button"
              onClick={() => setSubtasksOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium w-full"
              style={{ color: 'var(--col-text-body)' }}
            >
              Subtasks
              <CaretDownIcon size={16} className={subtasksOpen ? 'rotate-180' : ''} />
            </button>
            {subtasksOpen && (
              <div className="mt-2">
                {subtasks.map((item) => (
                  <input
                    key={item.id}
                    type="text"
                    className="modal-input mb-2"
                    placeholder="Subtask"
                    value={item.text}
                    onChange={(e) => updateSubtask(item.id, e.target.value)}
                  />
                ))}
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => addSubtask()}
                    className="text-sm flex items-center gap-1"
                    style={{ color: 'var(--col-text-muted)' }}
                  >
                    <PlusIcon size={14} /> New subtask
                  </button>
                </div>
              </div>
            )}
          </div>
          {onDelete && (
            <div className="modal-danger-footer">
              <button
                type="button"
                className="modal-danger-btn"
                onClick={() => { onDelete(); onClose() }}
              >
                <TrashIcon size={18} weight="regular" />
                Delete To Do
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
