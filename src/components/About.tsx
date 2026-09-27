import Reveal from './Reveal'
import CountUp from './CountUp'
import { PROFILE, PROJECTS, SKILL_GROUPS } from '../data/site'

// Honest counts derived from the site's own data — no invented metrics.
const STATS = [
  { n: PROFILE.interests.length, label: 'Focus areas' },
  { n: PROJECTS.length, label: 'Featured projects' },
  { n: new Set(SKILL_GROUPS.flatMap((g) => g.items)).size, label: 'Technologies' },
]

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about__grid">
        <Reveal as="h2" className="about__statement" from="clip">
          {PROFILE.aboutStatement.map((line) => (
            <span key={line} className="about__line">{line}</span>
          ))}
        </Reveal>
        <div className="about__body">
          <Reveal as="p" className="about__lead" delay={0.1}>
            I build digital experiences that combine <em className="hl">engineering, design and interaction.</em>
          </Reveal>
          <Reveal as="p" className="about__text" delay={0.18}>
            {PROFILE.aboutBody}
          </Reveal>
          <Reveal as="ul" className="about__tags" delay={0.26}>
            {PROFILE.interests.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </Reveal>
          <Reveal className="about__stats" delay={0.32}>
            {STATS.map((s) => (
              <div className="about__stat" key={s.label}>
                <b><CountUp to={s.n} /></b>
                <span>{s.label}</span>
              </div>
            ))}
          </Reveal>
          <Reveal as="p" className="about__sign" delay={0.38}>— ravikumar</Reveal>
        </div>
      </div>
    </section>
  )
}

