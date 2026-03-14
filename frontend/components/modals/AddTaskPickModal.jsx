import { Sparkle } from '@phosphor-icons/react'

export default function AddTaskPickModal({ onPickDaily, onPickTodo, onPickGenerateAI, onClose }) {
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
            Daily
          </button>
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg text-left font-medium btn-accent"
            onClick={onPickTodo}
          >
            To Do
          </button>
          <button
            type="button"
            className="w-full py-3 px-4 rounded-lg text-left font-medium flex items-center gap-2 btn-accent"
            onClick={onPickGenerateAI}
          >
            <Sparkle size={18} weight="fill" />
            Generate with AI
          </button>
        </div>
      </div>
    </div>
  )
}
