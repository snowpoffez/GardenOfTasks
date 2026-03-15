import { useState, useRef } from 'react'
import { SparkleIcon, FilePdfIcon, XIcon } from '@phosphor-icons/react'
import GrayScrollbar from '../GrayScrollbar'

// Call the backend germinate API to generate tasks
// Falls back to a fast mock response when the backend is not reachable or times out.
// Returns { quests, usedFallback }.
async function callGerminateAPI(text) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch('/api/germinate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error('Failed to generate tasks')
    }

    const data = await response.json()
    return { quests: data.quests, usedFallback: false }
  } catch (err) {
    console.warn('Germinate API failed, using mock tasks:', err)
    const promptSummary = text.split('\n')[0].slice(0, 60) || 'Your assignment'
    return {
      usedFallback: true,
      quests: [
        {
          id: 1,
          task_name: `Start: ${promptSummary}`,
          description: `Work through the assignment: ${text}`,
          xp: 40,
          category: 'Research',
          status: 'pending',
        },
        {
          id: 2,
          task_name: `Refine: ${promptSummary}`,
          description: `Review and refine your understanding of the task.`,
          xp: 25,
          category: 'Drafting',
          status: 'pending',
        },
      ],
    }
  } finally {
    clearTimeout(timeout)
  }
}

export default function GenerateAITaskModal({ onGenerated, onClose }) {
  const [description, setDescription] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
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

  const handleGenerate = async () => {
    const text = description.trim()
    if (!text && !pdfFile) return
    setIsGenerating(true)

    try {
      const pdfName = pdfFile?.name ?? ''
      const combinedText = text + (pdfName ? `\n[Attached PDF: ${pdfName}]` : '')

      // Call the germinate API
      const { quests, usedFallback: gotFallback } = await callGerminateAPI(combinedText)
      setUsedFallback(gotFallback)

      // Convert germinate API response to the format expected by addTodo
      const convertedTasks = quests.map(task => ({
        title: task.task_name,
        notes: task.description,
        rewardAmount: Math.floor(task.xp / 10), // Convert XP to reward amount
        damageAmount: 3, // Default damage
        dueDate: '',
        checklistItems: [], // Germinate doesn't provide subtasks
      }))

      // Add each generated task
      for (const taskData of convertedTasks) {
        onGenerated(taskData)
      }

      onClose()
    } catch (error) {
      console.error('Error generating tasks:', error)
      // You could add error state here if needed
    } finally {
      setIsGenerating(false)
    }
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
            <SparkleIcon size={20} weight="fill" style={{ color: 'var(--col-accent)' }} />
            Generate Tasks with AI
          </span>
          <button type="button" onClick={onClose} className="text-sm font-medium opacity-90 hover:opacity-100">
            Cancel
          </button>
        </div>
        <div className="modal-body flex flex-col flex-1 min-h-0">
          <GrayScrollbar>
          <div className="flex flex-col gap-4">
          <p className="text-sm opacity-90 shrink-0">
            Describe your assignment and our AI will break it down into multiple nature-themed tasks with XP rewards.
          </p>

          <div className="modal-field shrink-0">
            <label className="flex items-center gap-2">
              <FilePdfIcon size={18} />
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
                  <XIcon size={16} />
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
                <>Generating Tasks…</>
              ) : (
                <>
                  <SparkleIcon size={16} weight="fill" />
                  Generate Tasks
                </>
              )}
            </button>
          </div>
          </div>
          </GrayScrollbar>
        </div>
      </div>
    </div>
  )
}
