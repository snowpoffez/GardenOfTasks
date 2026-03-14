import { useState, useRef } from 'react'
import { Sparkle, FilePdf, X } from '@phosphor-icons/react'

// Frontend-only: parse assignment description into task + subtasks (no backend)
function parseAssignmentToTask(description, pdfFileName = '') {
  const lines = (description || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const title = lines[0] || 'New task'
  const notes = pdfFileName ? `PDF: ${pdfFileName}` : ''
  const subtaskLines = lines.slice(1).filter((line) => line.length > 0)
  const checklistItems = subtaskLines.map((line) => {
    const text = (line.replace(/^[\s•\-*]+\s*/, '').replace(/^\d+\.\s*/, '').trim()) || line
    return { id: `st-${Date.now()}-${Math.random().toString(36).slice(2)}`, text }
  })
  return {
    title,
    notes,
    rewardAmount: 3,
    damageAmount: 3,
    dueDate: '',
    checklistItems,
  }
}

export default function GenerateAITaskModal({ onGenerated, onClose }) {
  const [description, setDescription] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    } else if (file) {
      setPdfFile(null)
    }
  }

  const removePdf = () => {
    setPdfFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = () => {
    const text = description.trim()
    if (!text && !pdfFile) return
    setIsGenerating(true)
    const pdfName = pdfFile?.name ?? ''
    const combinedDescription = text + (pdfName ? `\n[Attached: ${pdfName}]` : '')
    const taskData = parseAssignmentToTask(combinedDescription, pdfName)
    setTimeout(() => {
      setIsGenerating(false)
      onGenerated(taskData)
      onClose()
    }, 400)
  }

  const canGenerate = (description.trim().length > 0) || pdfFile

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '92vw', maxWidth: '56rem', height: '88vh', maxHeight: '88vh' }}
      >
        <div className="modal-header flex items-center justify-between">
          <span className="font-semibold flex items-center gap-2">
            <Sparkle size={20} weight="fill" style={{ color: 'var(--col-accent)' }} />
            Generate task with AI
          </span>
          <button type="button" onClick={onClose} className="text-sm font-medium opacity-90 hover:opacity-100">
            Cancel
          </button>
        </div>
        <div className="modal-body flex flex-col gap-4 flex-1 min-h-0 overflow-auto">
          <p className="text-sm opacity-90 shrink-0">
            Describe your assignment (or paste instructions). Optionally attach a PDF. We&apos;ll create a task and subtasks from it.
          </p>

          <div className="modal-field shrink-0">
            <label className="flex items-center gap-2">
              <FilePdf size={18} />
              Upload PDF (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="text-sm w-full"
            />
            {pdfFile && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="truncate flex-1" title={pdfFile.name}>{pdfFile.name}</span>
                <button type="button" onClick={removePdf} className="p-1 rounded hover:bg-black/10" aria-label="Remove PDF">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="modal-field flex-1 flex flex-col min-h-0">
            <label>Describe your assignment</label>
            <textarea
              className="modal-input modal-textarea min-h-[200px] flex-1 w-full resize-y"
              placeholder="e.g. Essay on climate change&#10;- Research sources&#10;- Draft outline&#10;- Write first draft&#10;- Edit and submit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 shrink-0">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-sm font-medium">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className={`px-4 py-1.5 rounded text-sm font-medium shadow flex items-center gap-2 ${canGenerate && !isGenerating ? '' : 'btn-disabled'}`}
              style={canGenerate && !isGenerating ? { backgroundColor: 'var(--col-accent)', color: 'white' } : undefined}
            >
              {isGenerating ? (
                <>Generating…</>
              ) : (
                <>
                  <Sparkle size={16} weight="fill" />
                  Generate task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
