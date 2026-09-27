import Reveal from './Reveal'
import { SKILL_GROUPS } from '../data/site'

export default function Skills() {
  return (
    <section className="skills" id="skills" aria-label="Skills">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">Capabilities</Reveal>
        <Reveal as="h2" className="section-title" delay={0.08}>
          A stack for <em>ideas</em>, end to end.
        </Reveal>
      </div>
      <div className="skills__grid">
        {SKILL_GROUPS.map((g, gi) => (
          <Reveal key={g.title} className="skill" from="scale" delay={Math.min(gi * 0.06, 0.24)}>
            <h3 className="skill__title"><span>{String(gi + 1).padStart(2, '0')}</span>{g.title}</h3>
            <ul className="skill__items">
              {g.items.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
