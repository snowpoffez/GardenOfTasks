import { useState } from 'react'
import { CaretLeft, CaretRight, CurrencyDollar, Package, TrendUp } from '@phosphor-icons/react'

const QUEUE_GLOW_COUNT = 3

const deselectAll = (setters) => {
  setters.setSelectedSeedId(null)
  setters.setWaitingForSeed(false)
  setters.setPendingSlotIndex(null)
}

export default function GamePage({ garden, seedsCatalog, upgradesCatalog, gridUpgradeCost, onPlant, onHarvest, onBuyUpgrade }) {
  const { coins, slots, growthQueue } = garden
  const [selectedSeedId, setSelectedSeedId] = useState(null)
  const [waitingForSeed, setWaitingForSeed] = useState(false)
  const [pendingSlotIndex, setPendingSlotIndex] = useState(null)
  const [popupMessage, setPopupMessage] = useState(null)
  const [upgradesOpen, setUpgradesOpen] = useState(false)

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
    if (!canAffordAny) {
      setPopupMessage("You can't afford any seeds.")
      return
    }
    setPendingSlotIndex(slotIndex)
    setWaitingForSeed(true)
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

  const gridCols = Math.ceil(Math.sqrt(slots.length))

  return (
    <div
      className="flex-1 min-h-0 flex flex-col sm:flex-row gap-6 p-6 overflow-auto relative"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      {showDeselectOverlay && (
        <div className="garden-full-overlay" onClick={handleDeselect} aria-hidden />
      )}

      <aside
        className={`garden-upgrades-sidebar flex-shrink-0 order-0 flex flex-col ${upgradesOpen ? 'garden-upgrades-sidebar-open' : 'garden-upgrades-sidebar-collapsed'}`}
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
                          {cost}
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

      <main className="flex-1 min-w-0 flex flex-col items-center justify-center order-1">
        <h1 className="text-4xl sm:text-5xl font-semibold mb-2" style={{ color: 'var(--col-text-heading)' }}>
          The Garden
        </h1>
        <p className="text-base mb-4 text-center max-w-sm" style={{ color: 'var(--col-text-muted)' }}>
          Highlighted plots are next to receive growth when you complete dailies and tasks.
        </p>
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
              return (
                <button
                  key={slotIndex}
                  type="button"
                  className={`garden-slot ${queuePos ? `garden-slot-queue-${queuePos}` : ''} ${isFullyGrown ? 'garden-slot-harvest' : ''} ${raised ? 'garden-slot-raised' : ''}`}
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
              )
            })}
          </div>
        </div>
      </main>

      <aside className={`garden-shop flex-shrink-0 w-full sm:w-72 order-2 flex flex-col ${showDeselectOverlay ? 'garden-shop-raised' : ''}`}>
        <div className="garden-coins flex items-center gap-3 mb-8">
          <CurrencyDollar size={40} weight="bold" className="shrink-0" style={{ color: 'var(--col-accent)' }} />
          <span className="text-5xl font-bold leading-none tabular-nums" style={{ color: 'var(--col-text-heading)' }}>
            {coins}
          </span>
          <span className="text-3xl font-medium" style={{ color: 'var(--col-text-muted)' }}>coins</span>
        </div>
        <div className="garden-shop-box">
          <h2 className="text-3xl font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--col-text-heading)' }}>
            <Package size={28} />
            Shop
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--col-text-muted)' }}>
            Pick a seed, then tap an empty plot to plant. Complete tasks in The Greenhouse to grow.
          </p>
          <div className="flex flex-col gap-2">
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
                    {seed.cost} · {seed.stages} stages
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
      </aside>

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
