import { useState, useCallback } from 'react'
import Header from './components/Header'
import TasksPage from './pages/TasksPage'

const initialStats = {
  level: 5,
  hp: 50,
  maxHp: 50,
  xp: 3,
  maxXp: 150,
  energy: 6,
  maxEnergy: 30,
  gold: 42.3,
}

const initialDailies = [
  { id: 'd1', title: '', checked: true, stripColor: 'strip-checked', count: 1 },
  { id: 'd2', title: 'ef', checked: true, stripColor: 'strip-checked', count: 1 },
  { id: 'd3', title: '', checked: false, stripColor: 'strip-unchecked', count: 0 },
]

const initialTodos = []

function cloneState(dailies, todos) {
  return {
    dailies: dailies.map((d) => ({ ...d })),
    todos: todos.map((t) => ({
      ...t,
      checklistItems: t.checklistItems ? t.checklistItems.map((c) => ({ ...c })) : undefined,
    })),
  }
}

function App() {
  const [stats, setStats] = useState(initialStats)
  const [dailies, setDailies] = useState(initialDailies)
  const [todos, setTodos] = useState(initialTodos)
  const [todoTab, setTodoTab] = useState('active')
  const [history, setHistory] = useState([])
  const [addTaskModal, setAddTaskModal] = useState(null) // null | 'pick' | 'daily' | 'todo'

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev, cloneState(dailies, todos)])
  }, [dailies, todos])

  const handleDailyToggle = useCallback((dailyId) => {
    pushHistory()
    setDailies((prev) =>
      prev.map((d) =>
        d.id === dailyId ? { ...d, checked: !d.checked } : d
      )
    )
  }, [pushHistory])

  const handleOpenAddTask = useCallback(() => {
    setAddTaskModal('pick')
  }, [])

  const handleCloseAddTask = useCallback(() => {
    setAddTaskModal(null)
  }, [])

  const handleAddTodoWithData = useCallback((data) => {
    pushHistory()
    setTodos((prev) => [
      ...prev,
      {
        id: `todo-${Date.now()}`,
        title: data.title || 'New task',
        completed: false,
        notes: data.notes || '',
        rewardAmount: data.rewardAmount ?? 3,
        damageAmount: data.damageAmount ?? 3,
        dueDate: data.dueDate || '',
        checklistItems: data.checklistItems || [],
      },
    ])
    setAddTaskModal(null)
  }, [pushHistory])

  const handleAddDailyWithData = useCallback((data) => {
    pushHistory()
    setDailies((prev) => [
      ...prev,
      {
        id: `daily-${Date.now()}`,
        title: data.title || '',
        checked: false,
        stripColor: 'strip-unchecked',
        count: 0,
        notes: data.notes || '',
        repeatInterval: data.repeatInterval || 'Daily',
        repeatEvery: data.repeatEvery ?? 1,
        repeatUnit: data.repeatUnit || 'day',
      },
    ])
    setAddTaskModal(null)
  }, [pushHistory])

  const handleTodoToggle = useCallback((todoId) => {
    pushHistory()
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      )
    )
  }, [pushHistory])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const snapshot = history[history.length - 1]
    setDailies(snapshot.dailies)
    setTodos(snapshot.todos)
    setHistory((prev) => prev.slice(0, -1))
  }, [history])

  const activeTodoCount = todos.filter((t) => !t.completed).length
  const incompleteDailyCount = dailies.filter((d) => !d.checked).length

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--col-bg-page)' }}>
      <Header stats={stats} />
      <TasksPage
        dailies={dailies}
        todos={todos}
        todoTab={todoTab}
        setTodoTab={setTodoTab}
        activeTodoCount={activeTodoCount}
        incompleteDailyCount={incompleteDailyCount}
        onDailyToggle={handleDailyToggle}
        onOpenAddTask={handleOpenAddTask}
        onAddTodoWithData={handleAddTodoWithData}
        onAddDailyWithData={handleAddDailyWithData}
        onCloseAddTask={handleCloseAddTask}
        addTaskModal={addTaskModal}
        onPickTodo={() => setAddTaskModal('todo')}
        onPickDaily={() => setAddTaskModal('daily')}
        onTodoToggle={handleTodoToggle}
        onUndo={handleUndo}
        canUndo={history.length > 0}
      />
    </div>
  )
}

export default App
