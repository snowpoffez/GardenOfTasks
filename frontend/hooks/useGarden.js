import { useState, useCallback } from 'react'
import { SEEDS_CATALOG, GARDEN_GRID_SIZE, HARVEST_PROFIT, MAX_GARDEN_SLOTS, getGridUpgradeCost, UPGRADES_CATALOG } from '../constants/garden'

export function useGarden() {
  const [garden, setGarden] = useState(() => ({
    coins: 1e16,
    slots: Array(GARDEN_GRID_SIZE).fill(null),
    growthQueue: [],
    lastGrownSlots: [],
  }))

  const addGrowth = useCallback((amount) => {
    setGarden((prev) => {
      let { slots, growthQueue } = prev
      slots = slots.map((s) => (s ? { ...s } : null))
      growthQueue = [...growthQueue]
      const grownSlots = []
      let anyHarvestReady = false
      for (let i = 0; i < amount && growthQueue.length > 0; i++) {
        const slotIndex = growthQueue.shift()
        const plant = slots[slotIndex]
        if (!plant) continue
        const seed = SEEDS_CATALOG.find((s) => s.id === plant.seedId)
        if (!seed) continue
        const newStage = Math.min(plant.currentStage + 1, seed.stages)
        slots[slotIndex] = { ...plant, currentStage: newStage }
        grownSlots.push(slotIndex)
        growthQueue.push(slotIndex)
        if (newStage >= seed.stages) anyHarvestReady = true
      }
      // Only trigger navigate + animation when at least one crop became ready to harvest
      return { ...prev, slots, growthQueue, lastGrownSlots: anyHarvestReady ? grownSlots : [] }
    })
  }, [])

  const clearLastGrownSlots = useCallback(() => {
    setGarden((prev) => (prev.lastGrownSlots.length === 0 ? prev : { ...prev, lastGrownSlots: [] }))
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
      const earned = seed.cost + HARVEST_PROFIT
      if (seed.repeatHarvest) {
        const slots = [...prev.slots]
        slots[slotIndex] = { seedId: plant.seedId, currentStage: seed.stages - 1 }
        const growthQueue = prev.growthQueue.filter((i) => i !== slotIndex)
        growthQueue.push(slotIndex)
        return { ...prev, coins: prev.coins + earned, slots, growthQueue }
      }
      const slots = [...prev.slots]
      slots[slotIndex] = null
      const growthQueue = prev.growthQueue.filter((i) => i !== slotIndex)
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

  return { garden, addGrowth, plantSeed, harvest, buyUpgrade, clearLastGrownSlots }
}
