import { useState, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'
import GamePage from './pages/GamePage'
import StatPage from './pages/StatPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import { useGarden } from './hooks/useGarden'
import { useTasks } from './hooks/useTasks'
import { SEEDS_CATALOG, UPGRADES_CATALOG, MAX_GARDEN_SLOTS, getGridUpgradeCost } from './constants/garden'

const PATHS = {
  greenhouse: '/greenhouse',
  garden: '/garden',
  arboretum: '/arboretum',
  profile: '/profile',
  settings: '/settings',
}
const PATH_TO_PAGE = Object.fromEntries(Object.entries(PATHS).map(([k, v]) => [v, k]))

function pathnameToPage(pathname) {
  return PATH_TO_PAGE[pathname] ?? 'greenhouse'
}

const initialStats = {
  level: 1,
  xp: 0,
  maxXp: 100,
  gold: 42.3,
}

function getMaxXpForLevel(level) {
  return 100 + (level - 1) * 50
}

function App() {
  const [stats, setStats] = useState(initialStats)
  const [lastEarnedXp, setLastEarnedXp] = useState(null)
  const [pendingGardenNav, setPendingGardenNav] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const currentPage = pathnameToPage(pathname)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authView, setAuthView] = useState('home') // 'home' | 'login'
  const [user, setUser] = useState(null) // { username } when logged in

  const { garden, addGrowth, plantSeed, harvest, buyUpgrade, clearLastGrownSlots } = useGarden(user?.user_id)

  // Load level and XP from DB when user logs in
  useEffect(() => {
    const uid = user?.user_id
    if (!uid) return
    Promise.all([
      fetch(`/api/users/${uid}/level`).then((r) => r.json()),
      fetch(`/api/users/${uid}/xp`).then((r) => r.json()),
    ])
      .then(([levelRes, xpRes]) => {
        const level = levelRes?.level ?? 1
        const xp = xpRes?.xp ?? 0
        setStats((prev) => ({
          ...prev,
          level,
          xp,
          maxXp: getMaxXpForLevel(level),
        }))
      })
      .catch((err) => console.error('Failed to load level/xp:', err))
  }, [user?.user_id])

  const statsRef = useRef(stats)
  useEffect(() => {
    statsRef.current = stats
  }, [stats])

  const addXp = useCallback(
    (amount) => {
      if (!amount || amount < 0) return
      const uid = user?.user_id
      const amt = Math.round(amount)
      setLastEarnedXp((prev) => (prev ?? 0) + amt)

      if (uid) {
        fetch(`/api/users/${uid}/add-xp`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xp_gain: amt }),
        })
          .then((r) => r.json())
          .then((data) => {
            const newXp = data?.new_xp ?? 0
            setStats((prev) => ({ ...prev, xp: newXp }))
            const currentLevel = statsRef.current?.level ?? 1
            const maxXp = getMaxXpForLevel(currentLevel)
            if (newXp >= maxXp) {
              return fetch(`/api/users/${uid}/level-up`, { method: 'POST' })
                .then((r) => r.json())
                .then((levelData) => {
                  if (levelData?.new_level) {
                    setStats((prev) => ({
                      ...prev,
                      level: levelData.new_level,
                      xp: 0,
                      maxXp: getMaxXpForLevel(levelData.new_level),
                    }))
                  }
                })
            }
          })
          .catch((err) => console.error('Failed to add XP:', err))
      } else {
        setStats((prev) => {
          let { level, xp, maxXp } = prev
          xp += amt
          while (xp >= maxXp) {
            xp -= maxXp
            level += 1
            maxXp = getMaxXpForLevel(level)
          }
          return { ...prev, level, xp, maxXp }
        })
      }
    },
    [user?.user_id]
  )

  const clearLastEarnedXp = useCallback(() => setLastEarnedXp(null), [])

  const tasks = useTasks(addGrowth, user?.user_id, addXp)

  // When a harvest-ready crop appears, signal TaskPage to navigate after its animation.
  const prevGrownSlotsRef = useRef(garden.lastGrownSlots ?? [])
  useEffect(() => {
    const prev = prevGrownSlotsRef.current
    const next = garden.lastGrownSlots ?? []
    prevGrownSlotsRef.current = next
    if (prev.length === 0 && next.length > 0) setPendingGardenNav(true)
  }, [garden.lastGrownSlots])

  const handleNavigateToGarden = useCallback(() => {
    setPendingGardenNav(false)
    navigate(PATHS.garden)
  }, [navigate])

  useEffect(() => {
    if (loggedIn && pathname === '/') navigate(PATHS.greenhouse, { replace: true })
  }, [loggedIn, pathname, navigate])

  // When leaving the garden, clear animation state so it doesn't replay on return.
  useEffect(() => {
    if (pathname !== PATHS.garden && garden.lastGrownSlots?.length > 0) {
      clearLastGrownSlots()
      clearLastEarnedXp()
    }
  }, [pathname, garden.lastGrownSlots?.length, clearLastGrownSlots, clearLastEarnedXp])

  const activeTodoCount = tasks.todos.filter((t) => !t.completed).length
  const incompleteDailyCount = tasks.dailies.filter((d) => !d.checked).length

  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData ?? { username: 'Gardener' })
    setLoggedIn(true)
    navigate(PATHS.greenhouse)
  }, [navigate])

  const handleLogout = useCallback(() => {
    setUser(null)
    setLoggedIn(false)
    navigate(PATHS.greenhouse)
    setAuthView('home')
  }, [navigate])

  const handleNavigate = useCallback((page) => navigate(PATHS[page] ?? PATHS.greenhouse), [navigate])

  if (!loggedIn) {
    return (
      <div className="app-page h-full flex flex-col">
        {authView === 'home' && (
          <HomePage
            onGoToLogin={() => setAuthView('login')}
            onDevEnter={() => { setUser({ username: 'Gardener', user_id: 1}); setLoggedIn(true); navigate(PATHS.greenhouse) }}
          />
        )}
        {authView === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setAuthView('home')} />
        )}
      </div>
    )
  }

  return (
    <div className="app-page h-full flex flex-col">
      <Header
        user={user}
        stats={{ level: stats.level, xp: stats.xp, maxXp: stats.maxXp, gold: garden.coins }}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {currentPage === 'greenhouse' && (
        <TaskPage
          dailies={tasks.dailies}
          dailyOrderIds={tasks.dailyOrderIds}
          todos={tasks.todos}
          todoTab={tasks.todoTab}
          setTodoTab={tasks.setTodoTab}
          activeTodoCount={activeTodoCount}
          incompleteDailyCount={incompleteDailyCount}
          onDailyToggle={tasks.toggleDaily}
          onOpenAddTask={tasks.openAddTask}
          onAddTodo={tasks.addTodo}
          onAddDaily={tasks.addDaily}
          onCloseAddTask={tasks.closeAddTask}
          addTaskModal={tasks.addTaskModal}
          onPickTodo={() => tasks.setAddTaskModal('todo')}
          onPickDaily={() => tasks.setAddTaskModal('daily')}
          onPickGenerateAI={() => tasks.setAddTaskModal('generate-ai')}
          onTodoToggle={tasks.toggleTodo}
          onResetDailies={tasks.resetDailies}
          onReorderDailies={tasks.reorderDailies}
          onReorderTodos={tasks.reorderTodos}
          editingTodoId={tasks.editingTodoId}
          editingDailyId={tasks.editingDailyId}
          onOpenEditTodo={tasks.openEditTodo}
          onOpenEditDaily={tasks.openEditDaily}
          onCloseEdit={tasks.closeEdit}
          onEditTodo={tasks.editTodo}
          onEditDaily={tasks.editDaily}
          onDeleteTodo={tasks.deleteTodo}
          onDeleteDaily={tasks.deleteDaily}
          lastEarnedXp={lastEarnedXp}
          onClearLastEarnedXp={clearLastEarnedXp}
          pendingGardenNav={pendingGardenNav}
          onNavigateToGarden={handleNavigateToGarden}
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
          lastGrownSlots={garden.lastGrownSlots ?? []}
          onClearGrownSlots={clearLastGrownSlots}
          lastEarnedXp={lastEarnedXp}
          onClearLastEarnedXp={clearLastEarnedXp}
        />
      )}

      {currentPage === 'arboretum' && <StatPage />}
      {currentPage === 'profile' && <ProfilePage user={user} stats={{ ...stats, gold: garden.coins }} />}
      {currentPage === 'settings' && <SettingsPage />}
    </div>
  )
}

export default App
