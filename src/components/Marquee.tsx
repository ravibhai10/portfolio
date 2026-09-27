const ITEMS = [
  'Full-Stack Development',
  'AI / Generative AI',
  'Computer Vision',
  'Interactive Web',
  'Embedded Systems',
  'Creative Development',
]

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <section className="marquee" aria-label="Focus areas">
      <div className="marquee__track">
        {row.map((item, i) => (
          <span key={i} className="marquee__item" aria-hidden={i >= ITEMS.length}>
            {item}
            <span className="marquee__dot" aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </section>
  )
}
