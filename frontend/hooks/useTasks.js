import { useState, useCallback, useEffect } from 'react'
import { DAILY_ACCENT_COLORS, initialDailies, initialDailyOrderIds, initialTodos } from '../constants/tasks'
import { useHistory } from './useHistory'

export function useTasks(addGrowth, userId) {
  const [dailies, setDailies] = useState(initialDailies)
  const [dailyOrderIds, setDailyOrderIds] = useState(initialDailyOrderIds)
  const [todos, setTodos] = useState([])
  const [todoTab, setTodoTab] = useState('active')
  const [addTaskModal, setAddTaskModal] = useState(null) // null | 'pick' | 'daily' | 'todo' | 'generate-ai'
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingDailyId, setEditingDailyId] = useState(null)

  const { history, push: pushHistory, undo: undoHistory, canUndo } = useHistory()

  const push = useCallback(() => pushHistory(dailies, todos, dailyOrderIds), [pushHistory, dailies, todos, dailyOrderIds])

  // Load tasks from backend on userId change (e.g. login/logout)
  useEffect(() => {
    if (!userId) return
    fetch(`/api/tasks/${userId}`)
      .then((res) => res.json())
      .then((tasks) => {
        setTodos(tasks.map(t => ({
          id: t.id,
          title: t.task_name,
          notes: t.description,
          completed: t.status === 'completed',
          rewardAmount: t.xp,
          dueDate: '', // Backend doesn't support due dates yet
          checklistItems: [], // Backend doesn't support subtasks yet
          accentColor: DAILY_ACCENT_COLORS[Math.floor(Math.random() * DAILY_ACCENT_COLORS.length)],
        })))
      })
  }, [userId])

  // --- Daily actions ---

  const toggleDaily = useCallback((dailyId) => {
    const daily = dailies.find((d) => d.id === dailyId)
    if (daily && !daily.checked) addGrowth(1)
    push()
    setDailies((prev) => prev.map((d) => d.id === dailyId ? { ...d, checked: !d.checked } : d))
  }, [push, dailies, addGrowth])

  const addDaily = useCallback((data) => {
    push()
    const newId = `daily-${Date.now()}`
    const accentColor = DAILY_ACCENT_COLORS[Math.floor(Math.random() * DAILY_ACCENT_COLORS.length)]
    setDailies((prev) => [...prev, {
      id: newId,
      title: data.title || '',
      checked: false,
      accentColor,
      count: 0,
      notes: data.notes || '',
      dueDate: data.dueDate || '',
      repeatInterval: data.repeatInterval || 'Daily',
      repeatEvery: data.repeatEvery ?? 1,
      repeatUnit: data.repeatUnit || 'day',
    }])
    setDailyOrderIds((prev) => [...prev, newId])
    setAddTaskModal(null)
  }, [push])

  const editDaily = useCallback((data) => {
    if (!editingDailyId) return
    push()
    setDailies((prev) => prev.map((d) => d.id === editingDailyId ? {
      ...d,
      title: data.title ?? d.title,
      notes: data.notes ?? d.notes,
      accentColor: data.accentColor ?? d.accentColor,
      rewardAmount: data.rewardAmount ?? d.rewardAmount,
      damageAmount: data.damageAmount ?? d.damageAmount,
      dueDate: data.dueDate ?? d.dueDate,
      repeatInterval: data.repeatInterval ?? d.repeatInterval,
      repeatEvery: data.repeatEvery ?? d.repeatEvery,
      repeatUnit: data.repeatUnit ?? d.repeatUnit,
    } : d))
    setEditingDailyId(null)
  }, [editingDailyId, push])

  const resetDailies = useCallback(() => {
    push()
    setDailies((prev) => prev.map((d) => ({ ...d, checked: false })))
  }, [push])

  const reorderDailies = useCallback((displayedIds, fromIndex, toIndex) => {
    if (fromIndex === toIndex || !displayedIds?.length) return
    push()
    const movedId = displayedIds[fromIndex]
    const newOrder = displayedIds.filter((id) => id !== movedId)
    newOrder.splice(toIndex, 0, movedId)
    setDailyOrderIds(newOrder)
  }, [push])

  const deleteDaily = useCallback((id) => {
    push()
    setDailies((prev) => prev.filter((d) => d.id !== id))
    setDailyOrderIds((prev) => prev.filter((orderId) => orderId !== id))
    setEditingDailyId(null)
  }, [push])
  // --- Todo actions ---

  const toggleTodo = useCallback((todoId) => {
    const todo = todos.find((t) => t.id === todoId)
    if (todo && !todo.completed) addGrowth(2)
    push()
    setTodos((prev) => prev.map((t) => t.id === todoId ? { ...t, completed: !t.completed } : t))
  }, [push, todos, addGrowth])

  const addTodo = useCallback(async (data) => {
    push()
    const accentColor = DAILY_ACCENT_COLORS[Math.floor(Math.random() * DAILY_ACCENT_COLORS.length)]

    // Save to database
    if (userId) {
      try {
        await fetch('/api/tasks/createtask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            task_name: data.title || 'New task',
            description: data.notes || '',
            xp: (data.rewardAmount ?? 3) * 10,
            status: 'todo'
          })
        })
      } catch (err) {
        console.error('Failed to save task:', err)
      }
    }

    setTodos((prev) => [...prev, {
      id: crypto.randomUUID(),
      title: data.title || 'New task',
      completed: false,
      accentColor,
      notes: data.notes || '',
      rewardAmount: data.rewardAmount ?? 3,
      damageAmount: data.damageAmount ?? 3,
      dueDate: data.dueDate || '',
      checklistItems: data.checklistItems || [],
    }])
    setAddTaskModal(null)
  }, [push])

  const editTodo = useCallback((data) => {
    if (!editingTodoId) return
    push()
    setTodos((prev) => prev.map((t) => t.id === editingTodoId ? {
      ...t,
      title: data.title || t.title,
      notes: data.notes ?? t.notes,
      accentColor: data.accentColor ?? t.accentColor,
      rewardAmount: data.rewardAmount ?? t.rewardAmount,
      damageAmount: data.damageAmount ?? t.damageAmount,
      dueDate: data.dueDate ?? t.dueDate,
      checklistItems: data.checklistItems ?? t.checklistItems ?? [],
    } : t))
    setEditingTodoId(null)
  }, [editingTodoId, push])

  const deleteTodo = useCallback((id) => {
    push()
    setTodos((prev) => prev.filter((t) => t.id !== id))
    setEditingTodoId(null)
  }, [push])

  const reorderTodos = useCallback((orderedIds) => {
    push()
    setTodos((prev) => {
      const byId = Object.fromEntries(prev.map((t) => [t.id, t]))
      return orderedIds.map((id) => byId[id]).filter(Boolean)
    })
  }, [push])

  // --- Undo ---

  const undo = useCallback(() => {
    undoHistory((snapshot) => {
      setDailies(snapshot.dailies)
      setTodos(snapshot.todos)
      if (snapshot.dailyOrderIds) setDailyOrderIds(snapshot.dailyOrderIds)
    })
  }, [undoHistory])

  // --- Modal helpers ---

  const openAddTask = useCallback(() => setAddTaskModal('pick'), [])
  const closeAddTask = useCallback(() => setAddTaskModal(null), [])
  const openEditTodo = useCallback((id) => setEditingTodoId(id), [])
  const openEditDaily = useCallback((id) => setEditingDailyId(id), [])
  const closeEdit = useCallback(() => { setEditingTodoId(null); setEditingDailyId(null) }, [])

  return {
    dailies, dailyOrderIds, todos, todoTab, setTodoTab,
    addTaskModal, setAddTaskModal,
    editingTodoId, editingDailyId,
    canUndo,
    // actions
    toggleDaily, addDaily, editDaily, deleteDaily, resetDailies, reorderDailies,
    toggleTodo, addTodo, editTodo, deleteTodo, reorderTodos,
    undo,
    openAddTask, closeAddTask, openEditTodo, openEditDaily, closeEdit,
  }
}
