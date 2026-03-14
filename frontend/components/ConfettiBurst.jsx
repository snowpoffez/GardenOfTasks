import { useEffect, useState } from 'react'

const PARTICLE_COUNT = 48
const COLORS = ['#c9a227', '#f59e0b', '#fbbf24', '#fcd34d', '#8b5cf6', '#a78bfa', '#34d399', '#6ee7b7']

/** One-time confetti burst. Trigger by changing `trigger` (e.g. increment). */
export default function ConfettiBurst({ trigger }) {
  const [particles, setParticles] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trigger == null) return
    const list = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angleDeg = (360 / PARTICLE_COUNT) * i + Math.random() * 20
      const angleRad = (angleDeg * Math.PI) / 180
      const dist = 90 + Math.random() * 60
      const tx = Math.cos(angleRad) * dist
      const ty = -Math.sin(angleRad) * dist - 20
      return {
        id: i,
        tx,
        ty,
        delay: Math.random() * 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
      }
    })
    setParticles(list)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [trigger])

  if (!visible || particles.length === 0) return null

  return (
    <div className="confetti-burst" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--delay': `${p.delay}s`,
            '--color': p.color,
            '--size': `${p.size}px`,
          }}
        />
      ))}
    </div>
  )
}
