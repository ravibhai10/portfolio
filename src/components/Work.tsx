import { type CSSProperties } from 'react'
import Reveal from './Reveal'
import { PROJECTS } from '../data/site'

export default function Work() {
  return (
    <section className="work" id="work" aria-label="Selected work">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">Selected Work</Reveal>
        <Reveal as="h2" className="section-title" delay={0.08}>
          Work that <em>earns</em> attention.
        </Reveal>
      </div>
      <ol className="work__list">
        {PROJECTS.map((p, i) => (
          <Reveal
            as="li"
            key={p.no}
            className="project"
            from={i % 2 ? 'right' : 'left'}
            delay={Math.min(i * 0.05, 0.2)}
            style={{ ['--pa' as string]: p.accent } as CSSProperties}
          >
            <article data-cursor={p.liveUrl || p.githubUrl ? 'VIEW' : undefined}>
              <div className="project__top">
                <span className="project__no">{p.no}</span>
                <span className="project__cat">{p.category}</span>
              </div>
              <h3 className="project__name">
                {p.liveUrl ? (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer">{p.name}<span className="project__arrow" aria-hidden="true">→</span></a>
                ) : (
                  <span>{p.name}<span className="project__arrow" aria-hidden="true">→</span></span>
                )}
              </h3>
              <p className="project__desc">{p.description}</p>
              <div className="project__meta">
                <ul className="project__stack">
                  {p.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <div className="project__links">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">View project →</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer">GitHub →</a>}
                  {!p.liveUrl && !p.githubUrl && (
                    <span className="project__pending">Case study on request</span>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
