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
    todos: todos.map((t) => ({ ...t })),
  }
}

function App() {
  const [stats, setStats] = useState(initialStats)
  const [dailies, setDailies] = useState(initialDailies)
  const [todos, setTodos] = useState(initialTodos)
  const [todoTab, setTodoTab] = useState('active')
  const [history, setHistory] = useState([])

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

  const handleAddTodo = useCallback(() => {
    pushHistory()
    setTodos((prev) => [
      ...prev,
      { id: `todo-${Date.now()}`, title: 'New task', completed: false },
    ])
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
        onAddTodo={handleAddTodo}
        onTodoToggle={handleTodoToggle}
        onUndo={handleUndo}
        canUndo={history.length > 0}
      />
    </div>
  )
}

export default App
