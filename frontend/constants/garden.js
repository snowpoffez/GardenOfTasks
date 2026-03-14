// Beginner costs: 10–100. Non-beginner: exponential spread, 2 sig figs, max ≥1B.
// Costs distributed so each category (fruits, veg, trees, wild) has low/medium/high.
// repeatHarvest: when fully grown, harvest gives coins but plant stays (resets one stage for re-grow).

const NON_STARTER_COST_MIN = 150
const NON_STARTER_COST_MAX = 1e12

function roundTo2SigFigs(n) {
  if (n === 0) return 0
  const exp = Math.floor(Math.log10(n))
  const scale = Math.pow(10, exp - 1)
  return Math.round(n / scale) * scale
}

/** Format coin amount for display: 10, 1.2k, 3.5M, 1B, 2.5T, 100Q, 1001Q, etc. */
export function formatCoins(n, decimals = 2) {
  if (n < 1000) return Number(n).toFixed(decimals).replace(/\.?0+$/, '')
  const d = decimals
  if (n < 1e6) return (n / 1e3).toFixed(d).replace(/\.?0+$/, '') + 'k'
  if (n < 1e9) return (n / 1e6).toFixed(d).replace(/\.?0+$/, '') + 'M'
  if (n < 1e12) return (n / 1e9).toFixed(d).replace(/\.?0+$/, '') + 'B'
  if (n < 1e15) return (n / 1e12).toFixed(d).replace(/\.?0+$/, '') + 'T'
  if (n < 1e18) return (n / 1e15).toFixed(d).replace(/\.?0+$/, '') + 'Q'
  return Math.floor(n / 1e15) + 'Q'
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

// 40 non-starter costs, ascending; assigned in alternating order (veg, fruit, tree, wild, ...).
const sortedNonStarter = expCosts(40, NON_STARTER_COST_MIN, NON_STARTER_COST_MAX)
// Stages for non-starters: trend upward with variation by position (cost order).
const NON_STARTER_STAGES = [
  4, 5, 3, 6, 4, 5, 7, 4, 6, 5, 8, 9, 7, 10, 11, 8, 12, 9, 10, 11,
  15, 18, 14, 22, 19, 17, 24, 20, 16, 21, 28, 25, 31, 27, 33, 29, 26, 35, 30, 38,
]

// Order: least to most cost, alternating veg → fruit → tree → wild (8 full rounds, then 2 veg + 2 fruit + 4 wild).
export const SEEDS_CATALOG = [
  // —— Starters ——
  { id: 'SF', name: 'Sunflower', cost: 10, stages: 1, isStarter: true },
  { id: 'RD', name: 'Radish', cost: 25, stages: 2, isStarter: true },
  { id: 'LT', name: 'Lettuce', cost: 50, stages: 3, isStarter: true },
  { id: 'PE', name: 'Pea', cost: 75, stages: 4, isStarter: true, repeatHarvest: true },
  { id: 'CH', name: 'Cherry', cost: 100, stages: 5, isStarter: true, repeatHarvest: true },
  // —— Alternating: veg, fruit, tree, wild (rounds 0–7) ——
  { id: 'ON', name: 'Onion', cost: sortedNonStarter[0], stages: NON_STARTER_STAGES[0], isStarter: false },
  { id: 'SB', name: 'Strawberry', cost: sortedNonStarter[1], stages: NON_STARTER_STAGES[1], isStarter: false, repeatHarvest: true },
  { id: 'HG', name: 'Hawthorn', cost: sortedNonStarter[2], stages: NON_STARTER_STAGES[2], isStarter: false },
  { id: 'DN', name: 'Dandelion', cost: sortedNonStarter[3], stages: NON_STARTER_STAGES[3], isStarter: false },
  { id: 'CR', name: 'Carrot', cost: sortedNonStarter[4], stages: NON_STARTER_STAGES[4], isStarter: false },
  { id: 'BL', name: 'Blueberry', cost: sortedNonStarter[5], stages: NON_STARTER_STAGES[5], isStarter: false, repeatHarvest: true },
  { id: 'DG', name: 'Dogwood', cost: sortedNonStarter[6], stages: NON_STARTER_STAGES[6], isStarter: false },
  { id: 'CL', name: 'Clover', cost: sortedNonStarter[7], stages: NON_STARTER_STAGES[7], isStarter: false },
  { id: 'PT', name: 'Potato', cost: sortedNonStarter[8], stages: NON_STARTER_STAGES[8], isStarter: false },
  { id: 'RS', name: 'Raspberry', cost: sortedNonStarter[9], stages: NON_STARTER_STAGES[9], isStarter: false, repeatHarvest: true },
  { id: 'PN', name: 'Pine', cost: sortedNonStarter[10], stages: NON_STARTER_STAGES[10], isStarter: false },
  { id: 'MS', name: 'Moss', cost: sortedNonStarter[11], stages: NON_STARTER_STAGES[11], isStarter: false },
  { id: 'BT', name: 'Beet', cost: sortedNonStarter[12], stages: NON_STARTER_STAGES[12], isStarter: false },
  { id: 'AP', name: 'Apple', cost: sortedNonStarter[13], stages: NON_STARTER_STAGES[13], isStarter: false, repeatHarvest: true },
  { id: 'BH', name: 'Birch', cost: sortedNonStarter[14], stages: NON_STARTER_STAGES[14], isStarter: false },
  { id: 'FR', name: 'Fern', cost: sortedNonStarter[15], stages: NON_STARTER_STAGES[15], isStarter: false },
  { id: 'CB', name: 'Cabbage', cost: sortedNonStarter[16], stages: NON_STARTER_STAGES[16], isStarter: false },
  { id: 'LM', name: 'Lemon', cost: sortedNonStarter[17], stages: NON_STARTER_STAGES[17], isStarter: false, repeatHarvest: true },
  { id: 'OK', name: 'Oak', cost: sortedNonStarter[18], stages: NON_STARTER_STAGES[18], isStarter: false },
  { id: 'VN', name: 'Violet', cost: sortedNonStarter[19], stages: NON_STARTER_STAGES[19], isStarter: false },
  { id: 'SP', name: 'Spinach', cost: sortedNonStarter[20], stages: NON_STARTER_STAGES[20], isStarter: false },
  { id: 'PL', name: 'Plum', cost: sortedNonStarter[21], stages: NON_STARTER_STAGES[21], isStarter: false },
  { id: 'CT', name: 'Cherry Tree', cost: sortedNonStarter[22], stages: NON_STARTER_STAGES[22], isStarter: false, repeatHarvest: true },
  { id: 'TH', name: 'Thistle', cost: sortedNonStarter[23], stages: NON_STARTER_STAGES[23], isStarter: false },
  { id: 'BP', name: 'Bell Pepper', cost: sortedNonStarter[24], stages: NON_STARTER_STAGES[24], isStarter: false, repeatHarvest: true },
  { id: 'PC', name: 'Peach', cost: sortedNonStarter[25], stages: NON_STARTER_STAGES[25], isStarter: false },
  { id: 'MP', name: 'Maple', cost: sortedNonStarter[26], stages: NON_STARTER_STAGES[26], isStarter: false },
  { id: 'LV', name: 'Lavender', cost: sortedNonStarter[27], stages: NON_STARTER_STAGES[27], isStarter: false },
  { id: 'TM', name: 'Tomato', cost: sortedNonStarter[28], stages: NON_STARTER_STAGES[28], isStarter: false, repeatHarvest: true },
  { id: 'GR', name: 'Grape', cost: sortedNonStarter[29], stages: NON_STARTER_STAGES[29], isStarter: false, repeatHarvest: true },
  { id: 'WL', name: 'Willow', cost: sortedNonStarter[30], stages: NON_STARTER_STAGES[30], isStarter: false },
  { id: 'TL', name: 'Tulip', cost: sortedNonStarter[31], stages: NON_STARTER_STAGES[31], isStarter: false },
  // —— Remaining: 2 veg, 2 fruit, 4 wild (no more trees) ——
  { id: 'CN', name: 'Corn', cost: sortedNonStarter[32], stages: NON_STARTER_STAGES[32], isStarter: false },
  { id: 'BR', name: 'Blackberry', cost: sortedNonStarter[33], stages: NON_STARTER_STAGES[33], isStarter: false, repeatHarvest: true },
  { id: 'HF', name: 'Heather', cost: sortedNonStarter[34], stages: NON_STARTER_STAGES[34], isStarter: false },
  { id: 'WR', name: 'Wild Rose', cost: sortedNonStarter[35], stages: NON_STARTER_STAGES[35], isStarter: false },
  { id: 'PM', name: 'Pumpkin', cost: sortedNonStarter[36], stages: NON_STARTER_STAGES[36], isStarter: false },
  { id: 'WM', name: 'Watermelon', cost: sortedNonStarter[37], stages: NON_STARTER_STAGES[37], isStarter: false },
  { id: 'OR', name: 'Orchid', cost: sortedNonStarter[38], stages: NON_STARTER_STAGES[38], isStarter: false },
  { id: 'FX', name: 'Foxglove', cost: sortedNonStarter[39], stages: NON_STARTER_STAGES[39], isStarter: false },
]

export const GARDEN_GRID_SIZE = 9
export const HARVEST_PROFIT = 8
export const MAX_GARDEN_SLOTS = 25

// Grid upgrade cost: base × (1, 3, 10, 30, 100, 300, 1000, ...) per expansion
const GRID_COST_BASE = 1000

export function getGridUpgradeCost(currentSlotCount) {
  const k = currentSlotCount - GARDEN_GRID_SIZE // 0 = first expansion (9 -> 10)
  if (k < 0) return 0
  const half = Math.floor(k / 2)
  const multiplier = k % 2 === 0 ? Math.pow(10, half) : 3 * Math.pow(10, half)
  return Math.round(GRID_COST_BASE * multiplier)
}

export const UPGRADES_CATALOG = [
  { id: 'grid', name: 'Expand garden', description: '+1 plot', maxSlots: MAX_GARDEN_SLOTS },
]
