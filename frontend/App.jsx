import { useState, useCallback } from 'react'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'
import GamePage from './pages/GamePage'
import StatPage from './pages/StatPage'
import { useGarden } from './hooks/useGarden'
import { useTasks } from './hooks/useTasks'
import { SEEDS_CATALOG, UPGRADES_CATALOG, MAX_GARDEN_SLOTS, getGridUpgradeCost } from './constants/garden'

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

function App() {
  const [stats] = useState(initialStats)
  const [currentPage, setCurrentPage] = useState('greenhouse')
  const [loggedIn, setLoggedIn] = useState(false)
  const [authView, setAuthView] = useState('home') // 'home' | 'login'

  const { garden, addGrowth, plantSeed, harvest, buyUpgrade } = useGarden()

  const tasks = useTasks(addGrowth)

  const activeTodoCount = tasks.todos.filter((t) => !t.completed).length
  const incompleteDailyCount = tasks.dailies.filter((d) => !d.checked).length

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
            onDevEnter={() => { setLoggedIn(true); setCurrentPage('greenhouse') }}
          />
        )}
        {authView === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setAuthView('home')} />
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--col-bg-page)' }}>
      <Header stats={{ ...stats, gold: garden.coins }} currentPage={currentPage} onNavigate={setCurrentPage} />

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
          onTodoToggle={tasks.toggleTodo}
          onUndo={tasks.undo}
          canUndo={tasks.canUndo}
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
