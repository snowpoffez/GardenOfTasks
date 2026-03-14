import { useState } from 'react'
import { Trash } from '@phosphor-icons/react'
import StarRating from '../StarRating'

const REPEAT_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly']

export default function DailyFormModal({ mode = 'add', initialData, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [value, setValue] = useState(initialData?.rewardAmount ?? initialData?.damageAmount ?? 3)
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '')
  const [repeatInterval, setRepeatInterval] = useState(initialData?.repeatInterval ?? 'Daily')
  const [repeatEvery, setRepeatEvery] = useState(initialData?.repeatEvery ?? 1)
  const unitByInterval = { Daily: 'day', Weekly: 'week', Monthly: 'month', Yearly: 'year' }
  const repeatUnit = unitByInterval[repeatInterval] || 'day'

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value.replace(/[^\d-]/g, '').slice(0, 10))
  }

  const handleSave = () => {
    onSave({
      title: title || 'New daily',
      notes,
      rewardAmount: value,
      damageAmount: value,
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
          <span className="font-semibold">{mode === 'add' ? 'Add Daily' : 'Edit Daily'}</span>
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
          {onDelete && (
            <div className="modal-danger-footer">
              <button
                type="button"
                className="modal-danger-btn"
                onClick={() => { onDelete(); onClose() }}
              >
                <Trash size={18} weight="regular" />
                Delete Daily
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
