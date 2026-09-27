import Reveal from './Reveal'

// Grounded strictly in repo content: the site brief describes a B.Tech
// Electronics & Computer Engineering student working across these areas.
// No institutions, dates, awards or employers are invented.
const MILESTONES = [
  { no: '01', title: 'Engineering foundation', text: 'B.Tech Electronics & Computer Engineering — circuits, systems and code.' },
  { no: '02', title: 'Full-stack craft', text: 'Premium websites and applications, from database to interface.' },
  { no: '03', title: 'AI & vision', text: 'Generative AI, computer vision and interactive experiments.' },
  { no: '04', title: 'Embedded builds', text: 'Microcontroller projects that move in the physical world.' },
]

export default function Journey() {
  return (
    <section className="journey" id="journey" aria-label="Progression">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">Progression</Reveal>
        <Reveal as="h2" className="section-title" delay={0.08}>
          Learning in <em>public</em>, building in depth.
        </Reveal>
      </div>
      <ol className="journey__list">
        {MILESTONES.map((m, i) => (
          <Reveal as="li" key={m.no} className="milestone" delay={Math.min(i * 0.06, 0.2)}>
            <span className="milestone__no">{m.no}</span>
            <div>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
