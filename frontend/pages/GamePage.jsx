import { useState, useEffect } from 'react'
import { CaretLeft, CaretRight, Package, TrendUp } from '@phosphor-icons/react'
import { formatCoins } from '../constants/garden'

const QUEUE_GLOW_COUNT = 3
const XP_FLOAT_MS = 1500

const deselectAll = (setters) => {
  setters.setSelectedSeedId(null)
  setters.setWaitingForSeed(false)
  setters.setPendingSlotIndex(null)
}

export default function GamePage({ garden, seedsCatalog, upgradesCatalog, gridUpgradeCost, onPlant, onHarvest, onBuyUpgrade, lastGrownSlots = [], onClearGrownSlots, lastEarnedXp, onClearLastEarnedXp }) {
  const { coins, slots, growthQueue } = garden
  const [selectedSeedId, setSelectedSeedId] = useState(null)
  const [waitingForSeed, setWaitingForSeed] = useState(false)
  const [pendingSlotIndex, setPendingSlotIndex] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)
  const [upgradesOpen, setUpgradesOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [slotClickedForShop, setSlotClickedForShop] = useState(null)

  const getSeed = (seedId) => seedsCatalog.find((s) => s.id === seedId)
  const emptySlotsCount = slots.filter((s) => !s).length
  const canAffordAny = seedsCatalog.some((s) => coins >= s.cost)

  const queuePosition = (slotIndex) => {
    const pos = growthQueue.indexOf(slotIndex)
    if (pos < 0 || pos >= QUEUE_GLOW_COUNT) return null
    return pos + 1
  }

  const handleDeselect = () => deselectAll({ setSelectedSeedId, setWaitingForSeed, setPendingSlotIndex })

  const handleSlotClick = (slotIndex) => {
    const plant = slots[slotIndex]
    if (plant) {
      const seed = getSeed(plant.seedId)
      if (seed && plant.currentStage >= seed.stages) onHarvest(slotIndex)
      return
    }
    if (selectedSeedId) {
      const seed = getSeed(selectedSeedId)
      if (seed && coins >= seed.cost) {
        onPlant(slotIndex, selectedSeedId)
        setSelectedSeedId(null)
      }
      return
    }
    // Empty slot, no seed selected: open shop with animation
    setSlotClickedForShop(slotIndex)
    setShopOpen(true)
    if (!canAffordAny) {
      setPopupMessage("You can't afford any seeds.")
    } else {
      setPendingSlotIndex(slotIndex)
      setWaitingForSeed(true)
    }
    setTimeout(() => setSlotClickedForShop(null), 450)
  }

  const handleSelectSeed = (seedId, canAfford, isSelected) => {
    if (emptySlotsCount === 0) {
      setPopupMessage('No available circle.')
      return
    }
    if (!canAfford) return
    if (pendingSlotIndex != null) {
      const seed = getSeed(seedId)
      if (seed && coins >= seed.cost) {
        onPlant(pendingSlotIndex, seedId)
        deselectAll({ setSelectedSeedId, setWaitingForSeed, setPendingSlotIndex })
      }
      return
    }
    setSelectedSeedId(isSelected ? null : seedId)
    setWaitingForSeed(false)
  }

  const showDeselectOverlay = selectedSeedId || waitingForSeed
  const isHole = (slotIndex) =>
    selectedSeedId ? !slots[slotIndex] : waitingForSeed && slotIndex === pendingSlotIndex

  const handleShopToggle = () => {
    if (shopOpen) {
      handleDeselect()
      setShopOpen(false)
    } else {
      setShopOpen(true)
    }
  }

  const gridCols = Math.ceil(Math.sqrt(slots.length))

  useEffect(() => {
    if (lastGrownSlots.length === 0) return
    const t = setTimeout(() => {
      onClearGrownSlots?.()
      onClearLastEarnedXp?.()
    }, XP_FLOAT_MS)
    return () => clearTimeout(t)
  }, [lastGrownSlots, onClearGrownSlots, onClearLastEarnedXp])

  return (
    <div
      className="flex-1 min-h-0 flex flex-col sm:flex-row gap-6 p-6 overflow-auto relative"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      {showDeselectOverlay && (
        <div className="garden-full-overlay" onClick={handleDeselect} aria-hidden />
      )}

      <main className="flex-1 min-w-0 flex flex-col items-center justify-center order-0">
        <div className="garden-grid-wrapper">
          <div
            className="garden-grid"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 5rem)`, gridTemplateRows: `repeat(${Math.ceil(slots.length / gridCols)}, 5rem)` }}
          >
            {slots.map((plant, slotIndex) => {
              const seed = plant ? getSeed(plant.seedId) : null
              const queuePos = queuePosition(slotIndex)
              const isFullyGrown = plant && seed && plant.currentStage >= seed.stages
              const label = plant ? `${plant.seedId}${plant.currentStage}` : null
              const raised = showDeselectOverlay && isHole(slotIndex)
              const openShopPing = !plant && slotIndex === slotClickedForShop
              const growPop = plant && lastGrownSlots.includes(slotIndex)
              const firstGrownSlot = lastGrownSlots[0]
              const showXpFloat = firstGrownSlot === slotIndex && lastEarnedXp != null
              return (
                <div key={slotIndex} className="garden-slot-wrapper">
                  <button
                    type="button"
                    className={`garden-slot ${queuePos ? `garden-slot-queue-${queuePos}` : ''} ${isFullyGrown ? 'garden-slot-harvest' : ''} ${raised ? 'garden-slot-raised' : ''} ${openShopPing ? 'garden-slot-open-shop' : ''} ${growPop ? 'garden-slot-grow-pop' : ''}`}
                    onClick={() => handleSlotClick(slotIndex)}
                    aria-label={plant ? `Plant ${label}, ${isFullyGrown ? 'harvest' : 'growing'}` : 'Empty plot'}
                  >
                    {label ? (
                      <>
                        <span
                          className="text-2xl sm:text-3xl font-bold tabular-nums"
                          style={{ color: 'var(--col-text-heading)' }}
                        >
                          {label}
                        </span>
                        {isFullyGrown && (
                          <span className="text-sm font-medium mt-1" style={{ color: 'var(--col-accent)' }}>
                            Harvest
                          </span>
                        )}
                      </>
                    ) : null}
                  </button>
                  {showXpFloat && (
                    <div className="xp-float" role="status" aria-live="polite">
                      <span className="xp-float-inner">+{lastEarnedXp} XP</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <div className="garden-right-sidebar flex-shrink-0 order-1 flex flex-col gap-3">
        <aside
          className={`garden-upgrades-sidebar flex flex-col ${upgradesOpen ? 'garden-upgrades-sidebar-open' : 'garden-upgrades-sidebar-collapsed'}`}
        >
          <button
            type="button"
            className="garden-upgrades-toggle"
            onClick={() => setUpgradesOpen((o) => !o)}
            aria-expanded={upgradesOpen}
            aria-label={upgradesOpen ? 'Collapse upgrades' : 'Expand upgrades'}
          >
            <TrendUp size={24} weight="bold" />
            <span className="garden-upgrades-toggle-label">Upgrades</span>
            {upgradesOpen ? <CaretLeft size={20} /> : <CaretRight size={20} />}
          </button>
          {upgradesOpen && (
            <div className="garden-upgrades-box">
              <p className="text-sm mb-3" style={{ color: 'var(--col-text-muted)' }}>
                Spend coins to improve your garden.
              </p>
              <div className="flex flex-col gap-3">
                {upgradesCatalog?.map((upgrade) => {
                  const currentSlots = upgrade.id === 'grid' ? slots.length : 0
                  const maxSlots = upgrade.maxSlots ?? 25
                  const atMax = currentSlots >= maxSlots
                  const cost = upgrade.id === 'grid' ? gridUpgradeCost : upgrade.cost
                  const canAfford = cost != null && coins >= cost
                  const canBuy = !atMax && canAfford
                  return (
                    <div key={upgrade.id} className="garden-upgrade-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold" style={{ color: 'var(--col-text-heading)' }}>{upgrade.name}</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--col-text-muted)' }}>
                            {atMax ? 'Maxed out' : `${upgrade.description} · ${currentSlots}/${maxSlots} plots`}
                          </p>
                        </div>
                        {!atMax && cost != null && (
                          <span className="text-sm tabular-nums shrink-0" style={{ color: 'var(--col-text-muted)' }}>
                            {formatCoins(cost, 2)}
                          </span>
                        )}
                      </div>
                      {!atMax && (
                        <button
                          type="button"
                          className={`garden-upgrade-btn ${!canBuy ? 'btn-disabled' : ''}`}
                          disabled={!canBuy}
                          onClick={() => canBuy && onBuyUpgrade?.(upgrade.id)}
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </aside>

        <aside className={`garden-shop-sidebar flex flex-col ${shopOpen ? 'garden-shop-sidebar-open' : 'garden-shop-sidebar-collapsed'} ${showDeselectOverlay ? 'garden-shop-raised' : ''}`}>
          <button
            type="button"
            className="garden-shop-toggle"
            onClick={handleShopToggle}
            aria-expanded={shopOpen}
            aria-label={shopOpen ? 'Collapse shop' : 'Expand shop'}
          >
            <Package size={24} weight="bold" />
            <span className="garden-shop-toggle-label">Shop</span>
            {shopOpen ? <CaretLeft size={20} /> : <CaretRight size={20} />}
          </button>
          {shopOpen && (
            <div className="garden-shop-box">
              <p className="text-sm mb-3" style={{ color: 'var(--col-text-muted)' }}>
                Pick a seed, then tap an empty plot to plant. Complete tasks in The Greenhouse to grow.
              </p>
              <div className="garden-shop-seed-list flex flex-col gap-2">
                {seedsCatalog.map((seed) => {
                  const canAfford = coins >= seed.cost
                  const isSelected = selectedSeedId === seed.id
                  const grayed = !canAfford || emptySlotsCount === 0
                  return (
                    <button
                      key={seed.id}
                      type="button"
                      className={`garden-shop-card text-left flex items-center justify-between ${grayed ? 'btn-disabled' : ''}`}
                      disabled={false}
                      onClick={() => handleSelectSeed(seed.id, canAfford, isSelected)}
                    >
                      <span className="text-base font-medium" style={{ color: 'var(--col-text-body)' }}>
                        {seed.name} <span className="text-sm opacity-80">({seed.id})</span>
                      </span>
                      <span className="text-base tabular-nums" style={{ color: 'var(--col-text-muted)' }}>
                        {formatCoins(seed.cost, 2)} · {seed.stages} stages
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedSeedId && (
                <p className="text-sm mt-3" style={{ color: 'var(--col-accent)' }}>
                  Click an empty plot to plant, or click elsewhere to cancel.
                </p>
              )}
              {waitingForSeed && (
                <p className="text-sm mt-3" style={{ color: 'var(--col-accent)' }}>
                  Pick a seed to plant there, or click elsewhere to cancel.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      {popupMessage && (
        <div className="modal-overlay garden-popup-warn" onClick={() => setPopupMessage(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '20rem' }}>
            <div className="modal-header">
              <span className="font-semibold">Notice</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--col-text-body)' }}>{popupMessage}</p>
              <button type="button" className="btn-accent mt-3 w-full py-2 rounded-lg font-medium" onClick={() => setPopupMessage(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
