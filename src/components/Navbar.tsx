import { useEffect, useState } from 'react'
import LiquidLogo from './LiquidLogo'
import ThemeToggle from './ThemeToggle'

const LINKS = ['About', 'Work', 'Skills', 'Services', 'Contact'] as const

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the fullscreen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <a className="nav__logo" href="#top" aria-label="ravikumar gupta — home">
          <LiquidLogo />
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l} className="nav__link" href={`#${l.toLowerCase()}`}>{l}</a>
          ))}
          <ThemeToggle />
          <a className="nav__cta" href="#contact">Let&rsquo;s Work Together</a>
        </nav>

        <div className="nav__mobile-actions">
          <ThemeToggle />
          <button
            className="nav__burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
        <a className="nav__cta" href="#contact" onClick={() => setMenuOpen(false)}>
          Let&rsquo;s Work Together
        </a>
      </div>
    </>
  )
}

