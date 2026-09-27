import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from './Reveal'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  { cam: 'CAM 01', title: 'Capture every angle', text: 'Synchronized cameras cover the full play surface with no blind spots.' },
  { cam: 'CAM 02', title: 'Track every athlete', text: 'Spatial calibration keeps each player located in shared 3D space.' },
  { cam: 'CAM 03', title: 'Fuse the scene', text: 'Views merge into one spatial understanding of the game.' },
  { cam: 'OUTPUT', title: 'Cut the story', text: 'The auto-director frames and exports the cinematic highlight.' },
]

export default function ApexDeepDive() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Mobile stacks the panels vertically (see CSS); no horizontal tween there.
    if (window.matchMedia('(max-width: 820px)').matches) return
    // Travel is measured from the real viewport width so panel 1 starts fully
    // visible at progress 0 and the final panel ends fully visible at progress 1.
    const travel = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
    gsap.set(track, { x: 0 })
    const tween = gsap.to(track, {
      x: () => -travel(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.apex',
        start: 'top top',
        end: () => `+=${travel() + window.innerHeight * 0.4}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          // Clamp progress-derived x so rounding never leaves a panel half-out.
          const t = Math.max(0, track.scrollWidth - viewport.clientWidth)
          gsap.set(track, { x: -t * self.progress })
        },
      },
    })
    // Re-measure after fonts/layout settle so hero + apex pins never fight.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(track, { clearProps: 'transform' })
    }
  }, [])

  return (
    <section className="apex" aria-label="Apex Vision deep dive">
      <div className="apex__pin">
        <div className="apex__intro">
          <Reveal as="p" className="eyebrow">Featured — Apex Vision</Reveal>
          <Reveal as="h2" className="apex__title" delay={0.08}>
            Multiple cameras.<br />One complete view.
          </Reveal>
        </div>
        <div className="apex__viewport" ref={viewportRef}>
        <div className="apex__track" ref={trackRef}>
          {STEPS.map((s, i) => (
            <div className="apex__card" key={s.cam}>
              <span className="apex__cam">{s.cam}</span>
              <span className="apex__step">0{i + 1} / 04</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <div className="apex__bars" aria-hidden="true">
                <span style={{ width: `${(i + 1) * 22}%` }} />
              </div>
            </div>
          ))}
        </div>
        </div>
        <p className="apex__note">Concept visualization — no fabricated match footage. Imagery from the real project can replace these panels.</p>
      </div>
    </section>
  )
}
