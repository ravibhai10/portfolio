import Reveal from './Reveal'
import { SERVICES } from '../data/site'

export default function Services() {
  return (
    <section className="services" id="services" aria-label="Services">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">Services</Reveal>
        <Reveal as="h2" className="section-title services__title" delay={0.08}>
          Let&rsquo;s build something <em>worth remembering.</em>
        </Reveal>
      </div>
      <ul className="services__rows">
        {SERVICES.map((s, i) => (
          <Reveal as="li" key={s.no} className="service" delay={Math.min(i * 0.04, 0.16)}>
            <a href="#contact">
              <span className="service__no">{s.no}</span>
              <span className="service__body">
                <span className="service__name">{s.title}</span>
                <span className="service__detail">{s.detail}</span>
              </span>
              <span className="service__arrow" aria-hidden="true">→</span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
