// Beginner costs: 10–100. Non-beginner: exponential spread, 2 sig figs, max ≥1B.
// Costs distributed so each category (fruits, veg, trees, wild) has low/medium/high.
// repeatHarvest: when fully grown, harvest gives coins but plant stays (resets one stage for re-grow).

const NON_STARTER_COST_MIN = 120
const NON_STARTER_COST_MAX = 1e9

function roundTo2SigFigs(n) {
  if (n === 0) return 0
  const exp = Math.floor(Math.log10(n))
  const scale = Math.pow(10, exp - 1)
  return Math.round(n / scale) * scale
}

/** Format coin amount for display: 10, 1.2k, 3.5M, 1B, etc. */
export function formatCoins(n) {
  if (n < 1000) return String(n)
  if (n < 1e6) return (n / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'k'
  if (n < 1e9) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M'
  if (n < 1e12) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B'
  return (n / 1e12).toFixed(2).replace(/\.?0+$/, '') + 'T'
}

// Exponential sequence from min to max, n values, each rounded to 2 sig figs
function expCosts(n, minC, maxC) {
  const costs = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    costs.push(roundTo2SigFigs(minC * Math.pow(maxC / minC, t)))
  }
  return costs.sort((a, b) => a - b)
}

// 40 non-starter costs; each category gets a spread of low/med/high (interleaved then shuffled per category)
const sortedNonStarter = expCosts(40, NON_STARTER_COST_MIN, NON_STARTER_COST_MAX)
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const fruitIndices = shuffle([0, 4, 8, 12, 16, 20, 24, 28, 32, 36])
const vegIndices = shuffle([1, 5, 9, 13, 17, 21, 25, 29, 33, 37])
const treeIndices = shuffle([2, 6, 10, 14, 18, 22, 26, 30])
const wildIndices = shuffle([3, 7, 11, 15, 19, 23, 27, 31, 34, 35, 38, 39])

export const SEEDS_CATALOG = [
  // —— Beginner (costs BEGINNER_COST_MIN–BEGINNER_COST_MAX) ——
  { id: 'SF', name: 'Sunflower', cost: 10, stages: 1, isStarter: true },
  { id: 'RD', name: 'Radish', cost: 25, stages: 2, isStarter: true },
  { id: 'LT', name: 'Lettuce', cost: 50, stages: 3, isStarter: true },
  { id: 'PE', name: 'Pea', cost: 75, stages: 4, isStarter: true, repeatHarvest: true },
  { id: 'CH', name: 'Cherry', cost: 100, stages: 5, isStarter: true, repeatHarvest: true },
  // —— Fruits (spread of costs) ——
  { id: 'SB', name: 'Strawberry', cost: sortedNonStarter[fruitIndices[0]], stages: 5, isStarter: false, repeatHarvest: true },
  { id: 'AP', name: 'Apple', cost: sortedNonStarter[fruitIndices[1]], stages: 6, isStarter: false, repeatHarvest: true },
  { id: 'BL', name: 'Blueberry', cost: sortedNonStarter[fruitIndices[2]], stages: 4, isStarter: false, repeatHarvest: true },
  { id: 'PC', name: 'Peach', cost: sortedNonStarter[fruitIndices[3]], stages: 5, isStarter: false },
  { id: 'GR', name: 'Grape', cost: sortedNonStarter[fruitIndices[4]], stages: 7, isStarter: false, repeatHarvest: true },
  { id: 'LM', name: 'Lemon', cost: sortedNonStarter[fruitIndices[5]], stages: 5, isStarter: false, repeatHarvest: true },
  { id: 'WM', name: 'Watermelon', cost: sortedNonStarter[fruitIndices[6]], stages: 8, isStarter: false },
  { id: 'BR', name: 'Blackberry', cost: sortedNonStarter[fruitIndices[7]], stages: 6, isStarter: false, repeatHarvest: true },
  { id: 'RS', name: 'Raspberry', cost: sortedNonStarter[fruitIndices[8]], stages: 5, isStarter: false, repeatHarvest: true },
  { id: 'PL', name: 'Plum', cost: sortedNonStarter[fruitIndices[9]], stages: 6, isStarter: false },
  // —— Vegetables ——
  { id: 'CR', name: 'Carrot', cost: sortedNonStarter[vegIndices[0]], stages: 4, isStarter: false },
  { id: 'TM', name: 'Tomato', cost: sortedNonStarter[vegIndices[1]], stages: 6, isStarter: false, repeatHarvest: true },
  { id: 'PT', name: 'Potato', cost: sortedNonStarter[vegIndices[2]], stages: 5, isStarter: false },
  { id: 'PM', name: 'Pumpkin', cost: sortedNonStarter[vegIndices[3]], stages: 7, isStarter: false },
  { id: 'CN', name: 'Corn', cost: sortedNonStarter[vegIndices[4]], stages: 6, isStarter: false },
  { id: 'BT', name: 'Beet', cost: sortedNonStarter[vegIndices[5]], stages: 5, isStarter: false },
  { id: 'BP', name: 'Bell Pepper', cost: sortedNonStarter[vegIndices[6]], stages: 5, isStarter: false, repeatHarvest: true },
  { id: 'ON', name: 'Onion', cost: sortedNonStarter[vegIndices[7]], stages: 4, isStarter: false },
  { id: 'CB', name: 'Cabbage', cost: sortedNonStarter[vegIndices[8]], stages: 5, isStarter: false },
  { id: 'SP', name: 'Spinach', cost: sortedNonStarter[vegIndices[9]], stages: 4, isStarter: false },
  // —— Trees ——
  { id: 'OK', name: 'Oak', cost: sortedNonStarter[treeIndices[0]], stages: 7, isStarter: false },
  { id: 'MP', name: 'Maple', cost: sortedNonStarter[treeIndices[1]], stages: 8, isStarter: false },
  { id: 'CT', name: 'Cherry Tree', cost: sortedNonStarter[treeIndices[2]], stages: 7, isStarter: false, repeatHarvest: true },
  { id: 'PN', name: 'Pine', cost: sortedNonStarter[treeIndices[3]], stages: 6, isStarter: false },
  { id: 'BH', name: 'Birch', cost: sortedNonStarter[treeIndices[4]], stages: 7, isStarter: false },
  { id: 'WL', name: 'Willow', cost: sortedNonStarter[treeIndices[5]], stages: 8, isStarter: false },
  { id: 'DG', name: 'Dogwood', cost: sortedNonStarter[treeIndices[6]], stages: 6, isStarter: false },
  { id: 'HG', name: 'Hawthorn', cost: sortedNonStarter[treeIndices[7]], stages: 5, isStarter: false },
  // —— Wild flora ——
  { id: 'FR', name: 'Fern', cost: sortedNonStarter[wildIndices[0]], stages: 6, isStarter: false },
  { id: 'TL', name: 'Tulip', cost: sortedNonStarter[wildIndices[1]], stages: 5, isStarter: false },
  { id: 'OR', name: 'Orchid', cost: sortedNonStarter[wildIndices[2]], stages: 3, isStarter: false },
  { id: 'DN', name: 'Dandelion', cost: sortedNonStarter[wildIndices[3]], stages: 3, isStarter: false },
  { id: 'CL', name: 'Clover', cost: sortedNonStarter[wildIndices[4]], stages: 4, isStarter: false },
  { id: 'TH', name: 'Thistle', cost: sortedNonStarter[wildIndices[5]], stages: 6, isStarter: false },
  { id: 'LV', name: 'Lavender', cost: sortedNonStarter[wildIndices[6]], stages: 5, isStarter: false },
  { id: 'MS', name: 'Moss', cost: sortedNonStarter[wildIndices[7]], stages: 5, isStarter: false },
  { id: 'WR', name: 'Wild Rose', cost: sortedNonStarter[wildIndices[8]], stages: 6, isStarter: false },
  { id: 'FX', name: 'Foxglove', cost: sortedNonStarter[wildIndices[9]], stages: 5, isStarter: false },
  { id: 'HF', name: 'Heather', cost: sortedNonStarter[wildIndices[10]], stages: 4, isStarter: false },
  { id: 'VN', name: 'Violet', cost: sortedNonStarter[wildIndices[11]], stages: 4, isStarter: false },
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
