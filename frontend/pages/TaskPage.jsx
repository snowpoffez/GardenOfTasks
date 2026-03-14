import { useMemo } from 'react'
import { ArrowCounterClockwise, Plus } from '@phosphor-icons/react'
import DailyCard from '../components/tasks/DailyCard'
import TodoItem from '../components/tasks/TodoItem'
import AddTaskPickModal from '../components/modals/AddTaskPickModal'
import TodoFormModal from '../components/modals/TodoFormModal'
import DailyFormModal from '../components/modals/DailyFormModal'
import GenerateAITaskModal from '../components/modals/GenerateAITaskModal'

function moveIndex(arr, fromIndex, toIndex) {
  if (fromIndex === toIndex) return arr
  const next = [...arr]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
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
  onUndo,
  canUndo,
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

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col" style={{ backgroundColor: 'var(--col-bg-page)' }}>
        <div className="flex justify-end gap-2 pt-5 pb-2 pr-20">
          <button
            type="button"
            onClick={onResetDailies}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow btn-accent"
          >
            DEV: CRON
          </button>
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

            {/* Dailies column */}
            <section className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--col-text-heading)' }}>Dailies</h2>
                <span
                  className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium"
                  style={{ backgroundColor: 'var(--col-accent)' }}
                >
                  {incompleteDailyCount}
                </span>
              </div>
              <div className="space-y-3">
                {displayedDailies.map((d, index) => (
                  <div
                    key={d.id}
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
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <DailyCard daily={d} onToggle={onDailyToggle} onEdit={onOpenEditDaily} />
                  </div>
                ))}
              </div>
            </section>

            {/* To Do's column */}
            <section className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--col-text-heading)' }}>To Do&apos;s</h2>
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
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <TodoItem todo={t} onToggle={onTodoToggle} onEdit={onOpenEditTodo} />
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
        />
      )}
    </>
  )
}
