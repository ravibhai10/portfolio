import { PROFILE } from '../data/site'
import { scrollTo } from '../lib/interactions'

const NAV = ['About', 'Work', 'Skills', 'Services', 'Contact'] as const

export default function Footer() {
  const { linkedin, github, instagram } = PROFILE.socials
  const socials = ([
    ['LinkedIn', linkedin],
    ['GitHub', github],
    ['Instagram', instagram],
  ] as [string, string | null][]).filter((s): s is [string, string] => Boolean(s[1]))

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <span className="footer__logo">ravikumar gupta</span>
          <p className="footer__tag">Building digital experiences that people remember.</p>
        </div>
        <nav className="footer__col" aria-label="Sections">
          <span className="footer__h">Explore</span>
          {NAV.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
          ))}
        </nav>
        <nav className="footer__col" aria-label="Elsewhere">
          <span className="footer__h">Elsewhere</span>
          {socials.length ? (
            socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
            ))
          ) : (
            <span className="footer__muted">Links coming soon</span>
          )}
        </nav>
      </div>
      <div className="footer__bottom">
        <span>© 2026 ravikumar gupta</span>
        <span className="footer__built">Built with React · GSAP · Lenis</span>
        <button className="footer__top-link" onClick={() => scrollTo(0)}>Back to top ↑</button>
      </div>
    </footer>
  )
}
