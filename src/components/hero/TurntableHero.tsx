import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TurntableCanvas, {
  TOTAL_FRAMES,
  type TurntableHandle,
} from './TurntableCanvas'
import Scramble from '../Scramble'
import { BACKEND } from '../../data/site'

gsap.registerPlugin(ScrollTrigger)

const LAST_INDEX = TOTAL_FRAMES - 1

/** Progress window in which the portrait shows its back side. */
const PANEL_IN = [0.42, 0.68] as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Smooth 0→1 ramp between two scroll thresholds (smoothstep). */
const ramp = (from: number, to: number, v: number) => {
  const t = clamp01((v - from) / (to - from))
  return t * t * (3 - 2 * t)
}

interface Props {
  onProgress?: (progress: number) => void
  onReady?: () => void
}

export default function TurntableHero({ onProgress, onReady }: Props) {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<TurntableHandle>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      canvasRef.current?.setFrame(0)
      // No scroll-driven turn under reduced motion: surface the backend panel
      // statically so its content is never gated behind animation.
      const panel = panelRef.current
      if (panel) {
        panel.style.opacity = '1'
        panel.style.visibility = 'visible'
      }
      return
    }

    const hero = heroRef.current
    if (!hero) return
    const texts = Array.from(hero.querySelectorAll<HTMLElement>('.hero__text'))

    // Scroll position -> frame index. One ScrollTrigger, no rival timeline.
    const st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(
          LAST_INDEX,
          Math.max(0, Math.round(self.progress * LAST_INDEX)),
        )
        canvasRef.current?.setFrame(index)
        indicatorRef.current?.classList.toggle('is-hidden', self.progress > 0.02)
        // Typography subtly exits while the portrait stays pinned; same
        // ScrollTrigger, no rival timeline.
        const fade = Math.min(1, self.progress / 0.18)
        texts.forEach((el) => {
          el.style.opacity = String(1 - fade)
          el.style.translate = `0 ${-30 * fade}px`
        })
        // Back-view panel: the backend practice fades in as the portrait turns
        // away, using the same progress value as the frame index.
        const panel = panelRef.current
        if (panel) {
          const inT = ramp(PANEL_IN[0], PANEL_IN[1], self.progress)
          panel.style.opacity = inT.toFixed(3)
          panel.style.translate = `${(-18 * (1 - inT)).toFixed(2)}px 0`
          panel.style.visibility = inT < 0.02 ? 'hidden' : 'visible'
        }
      },
    })

    return () => st.kill()
  }, [])

  // Cinematic touches: headline lines stagger up on first paint, and the
  // portrait stage drifts a few px toward the pointer when idle. Both are
  // fine-pointer + full-motion only.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const hero = heroRef.current
    const stage = hero?.querySelector<HTMLElement>('.stage')
    if (!stage) return
    const onMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      stage.style.transform = `translate(${(cx * 14).toFixed(2)}px, ${(cy * 14).toFixed(2)}px)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      stage.style.transform = ''
    }
  }, [])

  const handleReady = () => {
    canvasRef.current?.setFrame(0)
    ScrollTrigger.refresh() // recompute pin distances once layout is final
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const lines = heroRef.current?.querySelectorAll('.hero__title span')
      if (lines?.length) {
        gsap.from(lines, {
          yPercent: 120,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power4.out',
          delay: 0.15,
          clearProps: 'transform,opacity,visibility',
        })
      }
    }
    onReady?.()
  }

  return (
    <section className="hero" ref={heroRef} aria-label="Intro">
      <div className="hero__inner">
        <p className="hero__text hero__eyebrow">
          <Scramble text="Creative Full-Stack Developer" />
        </p>

        <div className="stage" data-cursor="EXPLORE">
          <TurntableCanvas
            ref={canvasRef}
            className="turntable-canvas"
            onProgress={onProgress}
            onReady={handleReady}
          />
        </div>

        <h1 className="hero__text hero__title">
          <span>Building digital</span>
          <span>experiences that</span>
          <span>people remember.</span>
        </h1>

        <div className="hero__text hero__aside">
          <p className="hero__support">
            I build premium websites, AI-powered products, interactive
            experiences and modern full-stack applications.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#work">View My Work</a>
            <a className="btn btn--ghost" href="#contact">Let&rsquo;s Work Together</a>
          </div>
        </div>

        {/* Back view: the other half of the practice — server-side work that
            usually stays off-screen. */}
        <div className="hero__backend" ref={panelRef}>
          <span className="hero__backend-eyebrow">{BACKEND.eyebrow}</span>
          <h2 className="hero__backend-title">{BACKEND.title}</h2>
          <p className="hero__backend-copy">{BACKEND.copy}</p>
          <ul className="hero__backend-tags">
            {BACKEND.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a className="hero__backend-link" href="#skills">
            See the full stack
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h12m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>

        <div className="scroll-indicator" ref={indicatorRef}>
          <span>Scroll to explore</span>
          <span className="arrow" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
