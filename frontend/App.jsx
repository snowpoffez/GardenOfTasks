import { useState, useCallback } from 'react'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'
import GamePage from './pages/GamePage'
import StatPage from './pages/StatPage'

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

const SEEDS_CATALOG = [
  { id: 'A', name: 'Sunflower', cost: 10, stages: 3, isStarter: true },
  { id: 'B', name: 'Tulip', cost: 25, stages: 5, isStarter: false },
  { id: 'C', name: 'Fern', cost: 15, stages: 6, isStarter: false },
  { id: 'D', name: 'Orchid', cost: 40, stages: 4, isStarter: false },
  { id: 'E', name: 'Oak', cost: 30, stages: 7, isStarter: false },
]
const GARDEN_GRID_SIZE = 9
const HARVEST_PROFIT = 8

const MAX_GARDEN_SLOTS = 25
// TODO: move grid upgrade cost formula to backend (base + repeating 2, 2.5, 2 multipliers)
const GRID_COST_BASE = 1000
const GRID_COST_MULTIPLIERS = [2, 2.5, 2] // repeating: x2, x2.5, x2, x2, x2.5, x2, ...

function getGridUpgradeCost(currentSlotCount) {
  const k = currentSlotCount - GARDEN_GRID_SIZE // 0 = first expansion (9 -> 10)
  if (k < 0) return 0
  let cost = GRID_COST_BASE
  for (let i = 0; i < k; i++) cost *= GRID_COST_MULTIPLIERS[i % GRID_COST_MULTIPLIERS.length]
  return Math.round(cost)
}

const UPGRADES_CATALOG = [
  { id: 'grid', name: 'Expand garden', description: '+1 plot', maxSlots: MAX_GARDEN_SLOTS },
]

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
  const [currentPage, setCurrentPage] = useState('greenhouse') // 'greenhouse' | 'garden' | 'arboretum'
  const [loggedIn, setLoggedIn] = useState(false)
  const [authView, setAuthView] = useState('home') // 'home' | 'login'

  const [garden, setGarden] = useState(() => ({
    coins: 100,
    slots: Array(GARDEN_GRID_SIZE).fill(null),
    growthQueue: [],
  }))

  const addGrowth = useCallback((amount) => {
    setGarden((prev) => {
      let { slots, growthQueue } = prev
      slots = slots.map((s) => (s ? { ...s } : null))
      growthQueue = [...growthQueue]
      for (let i = 0; i < amount && growthQueue.length > 0; i++) {
        const slotIndex = growthQueue.shift()
        const plant = slots[slotIndex]
        if (!plant) continue
        const seed = SEEDS_CATALOG.find((s) => s.id === plant.seedId)
        if (!seed) continue
        const newStage = Math.min(plant.currentStage + 1, seed.stages)
        slots[slotIndex] = { ...plant, currentStage: newStage }
        if (newStage >= seed.stages) growthQueue.push(slotIndex)
      }
      return { ...prev, slots, growthQueue }
    })
  }, [])

  const plantSeed = useCallback((slotIndex, seedId) => {
    const seed = SEEDS_CATALOG.find((s) => s.id === seedId)
    if (!seed) return
    setGarden((prev) => {
      if (prev.slots[slotIndex] != null || prev.coins < seed.cost) return prev
      const slots = [...prev.slots]
      slots[slotIndex] = { seedId, currentStage: 0 }
      const growthQueue = [...prev.growthQueue, slotIndex]
      return { ...prev, coins: prev.coins - seed.cost, slots, growthQueue }
    })
  }, [])

  const harvest = useCallback((slotIndex) => {
    setGarden((prev) => {
      const plant = prev.slots[slotIndex]
      if (!plant) return prev
      const seed = SEEDS_CATALOG.find((s) => s.id === plant.seedId)
      if (!seed || plant.currentStage < seed.stages) return prev
      const slots = [...prev.slots]
      slots[slotIndex] = null
      const growthQueue = prev.growthQueue.filter((i) => i !== slotIndex)
      const earned = seed.cost + HARVEST_PROFIT
      return { ...prev, coins: prev.coins + earned, slots, growthQueue }
    })
  }, [])

  const buyUpgrade = useCallback((upgradeId) => {
    if (upgradeId !== 'grid') return
    const upgrade = UPGRADES_CATALOG.find((u) => u.id === upgradeId)
    if (!upgrade) return
    const maxSlots = upgrade.maxSlots ?? MAX_GARDEN_SLOTS
    setGarden((prev) => {
      const cost = getGridUpgradeCost(prev.slots.length)
      if (prev.slots.length >= maxSlots || prev.coins < cost) return prev
      return { ...prev, coins: prev.coins - cost, slots: [...prev.slots, null] }
    })
  }, [])

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev, cloneState(dailies, todos)])
  }, [dailies, todos])

  const handleDailyToggle = useCallback((dailyId) => {
    const daily = dailies.find((d) => d.id === dailyId)
    if (daily && !daily.checked) addGrowth(1)
    pushHistory()
    setDailies((prev) =>
      prev.map((d) =>
        d.id === dailyId ? { ...d, checked: !d.checked } : d
      )
    )
  }, [pushHistory, dailies, addGrowth])

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
    const todo = todos.find((t) => t.id === todoId)
    if (todo && !todo.completed) addGrowth(2)
    pushHistory()
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      )
    )
  }, [pushHistory, todos, addGrowth])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const snapshot = history[history.length - 1]
    setDailies(snapshot.dailies)
    setTodos(snapshot.todos)
    setHistory((prev) => prev.slice(0, -1))
  }, [history])

  const handleReorderDailies = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    pushHistory()
    setDailies((prev) => {
      const next = [...prev]
      const [item] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, item)
      return next
    })
  }, [pushHistory])

  const handleReorderTodos = useCallback((orderedIds) => {
    pushHistory()
    setTodos((prev) => {
      const byId = Object.fromEntries(prev.map((t) => [t.id, t]))
      return orderedIds.map((id) => byId[id]).filter(Boolean)
    })
  }, [pushHistory])

  const activeTodoCount = todos.filter((t) => !t.completed).length
  const incompleteDailyCount = dailies.filter((d) => !d.checked).length

  const handleLoginSuccess = useCallback(() => {
    setLoggedIn(true)
    setCurrentPage('greenhouse')
  }, [])

  if (!loggedIn) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--col-bg-page)' }}>
        {authView === 'home' && (
          <HomePage
            onGoToLogin={() => setAuthView('login')}
            onDevEnter={() => {
              setLoggedIn(true)
              setCurrentPage('greenhouse')
            }}
          />
        )}
        {authView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setAuthView('home')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--col-bg-page)' }}>
      <Header stats={{ ...stats, gold: garden.coins }} currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'greenhouse' && (
      <TaskPage
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
        onReorderDailies={handleReorderDailies}
        onReorderTodos={handleReorderTodos}
      />
      )}
      {currentPage === 'garden' && (
        <GamePage
          garden={garden}
          seedsCatalog={SEEDS_CATALOG}
          upgradesCatalog={UPGRADES_CATALOG}
          gridUpgradeCost={garden.slots.length < MAX_GARDEN_SLOTS ? getGridUpgradeCost(garden.slots.length) : null}
          onPlant={plantSeed}
          onHarvest={harvest}
          onBuyUpgrade={buyUpgrade}
        />
      )}
      {currentPage === 'arboretum' && <StatPage />}
    </div>
  )
}

export default App
