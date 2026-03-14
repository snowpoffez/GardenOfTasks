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

/** meta can include { lastToggledId, lastToggledType: 'daily'|'todo' } for task-only undo + backend sync */
export function useHistory() {
  const [history, setHistory] = useState([])

  const push = useCallback((dailies, todos, dailyOrderIds, meta = {}) => {
    const entry = {
      snapshot: cloneState(dailies, todos, dailyOrderIds),
      lastToggledId: meta.lastToggledId,
      lastToggledType: meta.lastToggledType,
    }
    setHistory((prev) => [...prev, entry])
  }, [])

  const undo = useCallback((onRestore) => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const entry = prev[prev.length - 1]
      onRestore(entry.snapshot, entry)
      return prev.slice(0, -1)
    })
  }, [])

  return { push, undo, canUndo: history.length > 0 }
}
