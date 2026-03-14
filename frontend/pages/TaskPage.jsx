import { useMemo, useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus } from '@phosphor-icons/react'
import DailyCard from '../components/tasks/DailyCard'
import TodoItem from '../components/tasks/TodoItem'
import AddTaskPickModal from '../components/modals/AddTaskPickModal'
import TodoFormModal from '../components/modals/TodoFormModal'
import DailyFormModal from '../components/modals/DailyFormModal'
import GenerateAITaskModal from '../components/modals/GenerateAITaskModal'

const XP_FLOAT_MS = 1500
const DAILY_SLIDE_MS = 380

function moveIndex(arr, fromIndex, toIndex) {
  if (fromIndex === toIndex) return arr
  const next = [...arr]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

/**
 * Renders the XP float badge at fixed viewport coordinates via a portal,
 * escaping any overflow/clip context. top/left are the center of the source card.
 */
function XpFloatPortal({ top, left, amount }) {
  return createPortal(
    <div
      className="xp-float-portal"
      style={{ top, left }}
      role="status"
      aria-live="polite"
    >
      <span className="xp-float-inner">+{amount} XP</span>
    </div>,
    document.body,
  )
}

/** FLIP animation hook for a reorderable list.
 *  Returns [setNodeRef(id, el), snapshotPositions()].
 *  Call snapshotPositions() BEFORE the state update that reorders the list,
 *  then the hook plays the animation automatically after the next render. */
function useFlipList(ids) {
  const nodeRefs = useRef({})   // id → DOM element
  const snapRef = useRef(null)  // id → top (px, relative to viewport) before reorder

  const setNodeRef = useCallback((id, el) => {
    if (el) nodeRefs.current[id] = el
    else delete nodeRefs.current[id]
  }, [])

  const snapshotPositions = useCallback(() => {
    const snap = {}
    for (const [id, el] of Object.entries(nodeRefs.current)) {
      snap[id] = el.getBoundingClientRect().top
    }
    snapRef.current = snap
  }, [])

  useLayoutEffect(() => {
    const snap = snapRef.current
    if (!snap) return
    snapRef.current = null

    for (const [id, el] of Object.entries(nodeRefs.current)) {
      if (!(id in snap)) continue
      const newTop = el.getBoundingClientRect().top
      const delta = snap[id] - newTop
      if (delta === 0) continue
      // Snap to old position instantly, then animate to new position
      el.style.transition = 'none'
      el.style.transform = `translateY(${delta}px)`
      // Force reflow so the browser registers the starting position
      el.getBoundingClientRect()
      el.style.transition = `transform ${DAILY_SLIDE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      el.style.transform = 'translateY(0)'
      const onEnd = () => { el.style.transition = ''; el.style.transform = '' }
      el.addEventListener('transitionend', onEnd, { once: true })
    }
  }, [ids]) // re-run whenever the id order changes

  return [setNodeRef, snapshotPositions]
}

export default function TaskPage({
  dailies,
  dailyOrderIds,
  todos,
  todoTab,
  setTodoTab,
  activeTodoCount,
  incompleteDailyCount,
  onDailyToggle,
  onOpenAddTask,
  onAddTodo,
  onAddDaily,
  onCloseAddTask,
  addTaskModal,
  onPickTodo,
  onPickDaily,
  onPickGenerateAI,
  onTodoToggle,
  onResetDailies,
  onReorderDailies,
  onReorderTodos,
  editingTodoId,
  editingDailyId,
  onOpenEditTodo,
  onOpenEditDaily,
  onCloseEdit,
  onEditTodo,
  onEditDaily,
  onDeleteTodo,
  onDeleteDaily,
  lastEarnedXp,
  onClearLastEarnedXp,
  pendingGardenNav,
  onNavigateToGarden,
}) {
  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)
  const displayedTodos = todoTab === 'active' ? activeTodos : completedTodos

  const displayedDailies = useMemo(() => {
    const order = dailyOrderIds || []
    return [...dailies].sort((a, b) => {
      const ai = order.indexOf(a.id)
      const bi = order.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      const byChecked = (a.checked ? 1 : 0) - (b.checked ? 1 : 0)
      if (byChecked !== 0) return byChecked
      return ai - bi
    })
  }, [dailies, dailyOrderIds])

  const dailyIds = useMemo(() => displayedDailies.map((d) => d.id), [displayedDailies])
  const [setDailyRef, snapshotDailyPositions] = useFlipList(dailyIds)

  // Refs for measuring card positions at toggle time (for XP float portal)
  const cardRefs = useRef({}) // id → DOM element
  const setCardRef = useCallback((id, el) => {
    if (el) cardRefs.current[id] = el
    else delete cardRefs.current[id]
  }, [])

  // Viewport-fixed position for the XP float portal, measured at toggle time
  const [xpFloatPos, setXpFloatPos] = useState(null)

  const measureCard = useCallback((id) => {
    const el = cardRefs.current[id]
    if (!el) return
    const r = el.getBoundingClientRect()
    setXpFloatPos({ top: r.top + r.height / 2, left: r.left + r.width / 2 })
  }, [])

  // Wrap onDailyToggle to snapshot positions and measure XP float anchor
  const handleDailyToggle = useCallback((id) => {
    snapshotDailyPositions()
    measureCard(id)
    onDailyToggle(id)
  }, [snapshotDailyPositions, measureCard, onDailyToggle])

  // Wrap onTodoToggle to measure XP float anchor
  const handleTodoToggle = useCallback((id) => {
    measureCard(id)
    onTodoToggle(id)
  }, [measureCard, onTodoToggle])

  // After the XP float animation: navigate to garden if a crop became harvest-ready,
  // otherwise just clear the float.
  useEffect(() => {
    if (lastEarnedXp == null) return
    const t = setTimeout(() => {
      onClearLastEarnedXp?.()
      setXpFloatPos(null)
      if (pendingGardenNav) onNavigateToGarden?.()
    }, XP_FLOAT_MS)
    return () => clearTimeout(t)
  }, [lastEarnedXp, pendingGardenNav, onClearLastEarnedXp, onNavigateToGarden])

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex justify-end gap-2 pt-5 pb-2 pr-[5rem]">
          <button
            type="button"
            onClick={onResetDailies}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow btn-accent"
          >
            DEV: CRON
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

        <div className="flex flex-1 justify-center px-[5rem] pb-6 min-h-0">
          <div className="w-5/6 flex gap-8 min-h-0">

            {/* Dailies column */}
            <section className="flex-1 flex flex-col min-w-0 min-h-0">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>Dailies</h2>
                <span
                  className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                  style={{ backgroundColor: 'var(--col-accent)' }}
                >
                  {incompleteDailyCount}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-3 pb-2">
                  {displayedDailies.map((d, index) => (
                    <div
                      key={d.id}
                      ref={(el) => { setDailyRef(d.id, el); setCardRef(d.id, el) }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', String(index))
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
                        if (Number.isNaN(from)) return
                        onReorderDailies?.(displayedDailies.map((x) => x.id), from, index)
                      }}
                      className="task-card-enter cursor-grab active:cursor-grabbing"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <DailyCard daily={d} onToggle={handleDailyToggle} onEdit={onOpenEditDaily} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* To Do's column */}
            <section className="flex-1 flex flex-col min-w-0 min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--col-text-heading)' }}>To Do&apos;s</h2>
                <span
                  className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                  style={{ backgroundColor: 'var(--col-accent)' }}
                >
                  {activeTodoCount}
                </span>
              </div>
              <div className="flex gap-6 border-b mb-3 pt-1" style={{ borderColor: 'var(--col-tab-border)' }}>
                {['active', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTodoTab(tab)}
                    className="pb-2 text-sm font-medium border-b-2 capitalize"
                    style={
                      todoTab === tab
                        ? { color: 'var(--col-accent-hover)', borderColor: 'var(--col-accent)' }
                        : { color: 'var(--col-tab-inactive)', borderColor: 'transparent' }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-[160px] overflow-auto">
                {displayedTodos.length === 0 ? (
                  <div className="min-h-[160px] rounded-lg mt-1" style={{ backgroundColor: 'var(--col-bg-empty)' }} />
                ) : (
                  <div className="space-y-2 mt-1">
                    {displayedTodos.map((t, index) => (
                      <div
                        key={t.id}
                        ref={(el) => setCardRef(t.id, el)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData('text/plain', String(index))
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
                          if (Number.isNaN(from) || !onReorderTodos) return
                          const displayedIds = displayedTodos.map((x) => x.id)
                          const newDisplayedIds = moveIndex(displayedIds, from, index)
                          const otherIds = todos.map((x) => x.id).filter((id) => !displayedIds.includes(id))
                          onReorderTodos([...newDisplayedIds, ...otherIds])
                        }}
                        className="task-card-enter cursor-grab active:cursor-grabbing"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <TodoItem todo={t} onToggle={handleTodoToggle} onEdit={onOpenEditTodo} />
                      </div>
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
          onPickGenerateAI={onPickGenerateAI}
          onClose={onCloseAddTask}
        />
      )}
      {addTaskModal === 'generate-ai' && (
        <GenerateAITaskModal
          onGenerated={onAddTodo}
          onClose={onCloseAddTask}
        />
      )}
      {(addTaskModal === 'todo' || editingTodoId) && (
        <TodoFormModal
          mode={editingTodoId ? 'edit' : 'add'}
          initialData={editingTodoId ? todos.find((t) => t.id === editingTodoId) : undefined}
          onSave={editingTodoId ? onEditTodo : onAddTodo}
          onClose={editingTodoId ? onCloseEdit : onCloseAddTask}
          onDelete={editingTodoId ? () => onDeleteTodo(editingTodoId) : undefined}
        />
      )}
      {(addTaskModal === 'daily' || editingDailyId) && (
        <DailyFormModal
          mode={editingDailyId ? 'edit' : 'add'}
          initialData={editingDailyId ? dailies.find((d) => d.id === editingDailyId) : undefined}
          onSave={editingDailyId ? onEditDaily : onAddDaily}
          onClose={editingDailyId ? onCloseEdit : onCloseAddTask}
          onDelete={editingDailyId ? () => onDeleteDaily(editingDailyId) : undefined}
        />
      )}

      {lastEarnedXp != null && xpFloatPos != null && (
        <XpFloatPortal top={xpFloatPos.top} left={xpFloatPos.left} amount={lastEarnedXp} />
      )}
    </>
  )
}
