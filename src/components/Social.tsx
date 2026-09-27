import Reveal from './Reveal'
import { PROFILE } from '../data/site'

export default function Social() {
  const links = [
    { label: 'LinkedIn', url: PROFILE.socials.linkedin },
    { label: 'GitHub', url: PROFILE.socials.github },
    { label: 'Instagram', url: PROFILE.socials.instagram },
  ]
  const live = links.filter((l) => l.url)
  return (
    <section className="social" aria-label="Online presence">
      <Reveal as="p" className="eyebrow">Beyond code</Reveal>
      <Reveal as="h2" className="section-title" delay={0.08}>
        Building <em>beyond</em> code.
      </Reveal>
      {live.length > 0 ? (
        <ul className="social__links">
          {live.map((l) => (
            <li key={l.label}>
              <a href={l.url!} target="_blank" rel="noreferrer" data-cursor="OPEN →">
                {l.label}<span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <Reveal as="p" className="social__pending" delay={0.15}>
          Profiles go here — add LinkedIn and GitHub URLs in <code>src/data/site.ts</code> and they
          appear automatically. Nothing invented.
        </Reveal>
      )}
    </section>
  )
}
