import { useState } from 'react'
import { Star } from '@phosphor-icons/react'

export default function StarRating({ value, onChange, max = 5 }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div className="star-rating" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: max }, (_, i) => {
        const isHovering = hovered !== null
        // hovering higher than value: 0..value-1 full+bob, value..hovered pale+bob
        // hovering lower than value:  0..hovered full+bob, hovered+1..value-1 pale+bob
        const filledBob = isHovering && i <= Math.min(hovered, value - 1)
        const paleBob = isHovering && (
          (hovered >= value && i >= value && i <= hovered) ||
          (hovered < value  && i > hovered && i < value)
        )
        const isFilled = i < value
        const weight = (filledBob || (!isHovering && isFilled)) ? 'fill' : 'regular'
        const cls = [
          'star-btn',
          filledBob               ? 'filled star-bob' : '',
          paleBob                 ? 'star-pale star-bob' : '',
          !isHovering && isFilled ? 'filled' : '',
        ].filter(Boolean).join(' ')
        return (
          <button
            key={`${i}-${hovered}`}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i)}
            className={cls}
            style={isHovering ? { animationDelay: `${i * 55}ms` } : undefined}
            aria-label={`${i + 1} of ${max}`}
          >
            <Star size={24} weight={weight} />
          </button>
        )
      })}
    </div>
  )
}
