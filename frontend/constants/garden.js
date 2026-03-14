export const SEEDS_CATALOG = [
  { id: 'A', name: 'Sunflower', cost: 10, stages: 3, isStarter: true },
  { id: 'B', name: 'Tulip', cost: 25, stages: 5, isStarter: false },
  { id: 'C', name: 'Fern', cost: 15, stages: 6, isStarter: false },
  { id: 'D', name: 'Orchid', cost: 40, stages: 4, isStarter: false },
  { id: 'E', name: 'Oak', cost: 30, stages: 7, isStarter: false },
]

export const GARDEN_GRID_SIZE = 9
export const HARVEST_PROFIT = 8
export const MAX_GARDEN_SLOTS = 25

// TODO: move grid upgrade cost formula to backend (base + repeating 2, 2.5, 2 multipliers)
const GRID_COST_BASE = 1000
const GRID_COST_MULTIPLIERS = [2, 2.5, 2] // repeating: x2, x2.5, x2, ...

export function getGridUpgradeCost(currentSlotCount) {
  const k = currentSlotCount - GARDEN_GRID_SIZE // 0 = first expansion (9 -> 10)
  if (k < 0) return 0
  let cost = GRID_COST_BASE
  for (let i = 0; i < k; i++) cost *= GRID_COST_MULTIPLIERS[i % GRID_COST_MULTIPLIERS.length]
  return Math.round(cost)
}

export const UPGRADES_CATALOG = [
  { id: 'grid', name: 'Expand garden', description: '+1 plot', maxSlots: MAX_GARDEN_SLOTS },
]
