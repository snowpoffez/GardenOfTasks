/** Twinkling stars layer for the background. Use inside .app-page or .home-hero. */
export default function StarsLayer() {
  const positions = [
    { left: '8%', top: '12%' },
    { left: '22%', top: '8%' },
    { left: '45%', top: '15%' },
    { left: '78%', top: '10%' },
    { left: '92%', top: '18%' },
    { left: '15%', top: '35%' },
    { left: '85%', top: '32%' },
    { left: '5%', top: '55%' },
    { left: '55%', top: '48%' },
    { left: '95%', top: '60%' },
    { left: '30%', top: '75%' },
    { left: '70%', top: '82%' },
  ]
  return (
    <div className="stars-layer" aria-hidden="true">
      {positions.map((pos, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: pos.left,
            top: pos.top,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}
