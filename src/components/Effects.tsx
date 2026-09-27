import { useEffect, useRef } from 'react'
import { scrollTo, clamp, lerp } from '../lib/interactions'

// Sections whose dark ground the nav must invert over.
const DARK = '.apex, .final, footer'
// Cards that tilt in 3D on hover.
const TILT = '.apex__card, .skill'
// Cards that get a cursor-following spotlight.
const SPOT = '.project, .apex__card, .skill'
// Interactive targets that pull toward the cursor.
const MAGNET = '.btn, .nav__cta, .final__link'

/**
 * One mount-once layer for the site-wide interactions: scroll-progress bar,
 * scroll-velocity var (marquee lean), nav colour inversion over dark sections,
 * sticky section label, back-to-top, magnetic buttons, card tilt + spotlight,
 * and a click ripple. Every pointer effect is gated behind reduced-motion and
 * fine-pointer; the scroll indicators are motion-free and always run.
 */
export default function Effects() {
  const barRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLButtonElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const nav = document.querySelector<HTMLElement>('.nav')
    const darks = Array.from(document.querySelectorAll<HTMLElement>(DARK))
    const named = Array.from(
      document.querySelectorAll<HTMLElement>('section[id], section[aria-label]'),
    )
    const cleanups: Array<() => void> = []

    // -- scroll-driven indicators (progress, velocity, nav invert, label, top) --
    let lastY = window.scrollY
    let lastScroll = performance.now()
    let vel = 0
    let raf = 0
    let running = false
    const frame = () => {
      const y = window.scrollY
      const max = root.scrollHeight - window.innerHeight
      const p = max > 0 ? clamp(y / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`
      if (!reduced) {
        vel = lerp(vel, clamp((y - lastY) / 40, -1, 1), 0.2)
        root.style.setProperty('--sv', vel.toFixed(3))
      }
      lastY = y
      topRef.current?.classList.toggle('is-shown', y > window.innerHeight * 0.9)
      if (nav) {
        const onDark = darks.some((el) => {
          const r = el.getBoundingClientRect()
          return r.top <= 40 && r.bottom >= 40
        })
        nav.classList.toggle('nav--on-dark', onDark)
      }
      if (labelRef.current) {
        const mid = window.innerHeight / 2
        const cur = named.find((el) => {
          const r = el.getBoundingClientRect()
          return r.top <= mid && r.bottom >= mid
        })
        const name = cur?.id || cur?.getAttribute('aria-label') || ''
        if (name && labelRef.current.textContent !== name)
          labelRef.current.textContent = name
        labelRef.current.classList.toggle('is-shown', y > window.innerHeight * 0.6)
      }
      // Idle-stop: quit the loop once scrolling settles so we never burn a
      // permanent rAF on a static page.
      if (Math.abs(vel) < 0.001 && performance.now() - lastScroll > 250) {
        running = false
        root.style.setProperty('--sv', '0')
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }
    const onScroll = () => {
      lastScroll = performance.now()
      start()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', start, { passive: true })
    start()
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', start)
    })

    // -- pointer effects: fine-pointer + full-motion only --
    if (!reduced && !coarse) {
      document.querySelectorAll<HTMLElement>(MAGNET).forEach((el) => {
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect()
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`
        }
        const leave = () => {
          el.style.transform = ''
        }
        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        cleanups.push(() => {
          el.removeEventListener('mousemove', move)
          el.removeEventListener('mouseleave', leave)
          el.style.transform = ''
        })
      })

      document.querySelectorAll<HTMLElement>(SPOT).forEach((el) => {
        const tilt = el.matches(TILT)
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
          el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
          if (tilt)
            el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 5).toFixed(2)}deg)`
        }
        const leave = () => {
          if (tilt) el.style.transform = ''
        }
        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        el.classList.add('has-spot')
        cleanups.push(() => {
          el.removeEventListener('mousemove', move)
          el.removeEventListener('mouseleave', leave)
          el.style.transform = ''
          el.classList.remove('has-spot')
        })
      })

      const onClick = (e: MouseEvent) => {
        const r = document.createElement('span')
        r.className = 'ripple'
        r.style.left = `${e.clientX}px`
        r.style.top = `${e.clientY}px`
        document.body.appendChild(r)
        r.addEventListener('animationend', () => r.remove())
      }
      window.addEventListener('click', onClick)
      cleanups.push(() => window.removeEventListener('click', onClick))
    }

    // -- highlight swipe: reveal marker-pen underlines when scrolled into view --
    const hls = Array.from(document.querySelectorAll<HTMLElement>('.hl'))
    if (hls.length) {
      if (reduced) {
        hls.forEach((el) => el.classList.add('is-in'))
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('is-in')
                io.unobserve(e.target)
              }
            })
          },
          { threshold: 0.9 },
        )
        hls.forEach((el) => io.observe(el))
        cleanups.push(() => io.disconnect())
      }
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress__bar" ref={barRef} />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="section-label" ref={labelRef} aria-hidden="true" />
      <button
        className="to-top"
        ref={topRef}
        aria-label="Back to top"
        onClick={() => scrollTo(0)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 13V3m0 0 4 4M8 3 4 7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </>
  )
}
