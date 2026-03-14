import { useState, useCallback } from 'react'

function cloneState(dailies, todos, dailyOrderIds) {
  return {
    dailies: dailies.map((d) => ({ ...d })),
    todos: todos.map((t) => ({
      ...t,
      checklistItems: t.checklistItems ? t.checklistItems.map((c) => ({ ...c })) : undefined,
    })),
    dailyOrderIds: dailyOrderIds ? [...dailyOrderIds] : undefined,
  }
}

export function useHistory() {
  const [history, setHistory] = useState([])

  const push = useCallback((dailies, todos, dailyOrderIds) => {
    setHistory((prev) => [...prev, cloneState(dailies, todos, dailyOrderIds)])
  }, [])

  const undo = useCallback((onRestore) => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const snapshot = prev[prev.length - 1]
      onRestore(snapshot)
      return prev.slice(0, -1)
    })
  }, [])

  return { history, push, undo, canUndo: history.length > 0 }
}
