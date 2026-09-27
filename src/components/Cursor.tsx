import { useEffect, useRef } from 'react'

/** Desktop-only custom cursor. Small dot; expands with a label over [data-cursor] targets. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot) return

    let x = -100
    let y = -100
    let tx = x
    let ty = y
    let rx = x
    let ry = y
    let raf = 0
    let label = ''
    let visible = false

    const loop = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      dot.style.transform = `translate(${x}px, ${y}px)`
      if (ring) {
        rx += (tx - rx) * 0.12
        ry += (ty - ry) * 0.12
        ring.style.transform = `translate(${rx}px, ${ry}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    // Keep the dot fully hidden until the first real mousemove so it never
    // renders as a static dot in the viewport center in screenshots.
    const show = () => {
      if (!visible) {
        visible = true
        dot.classList.add('is-visible')
        ring?.classList.add('is-visible')
      }
    }
    const hide = () => {
      visible = false
      dot.classList.remove('is-visible')
      ring?.classList.remove('is-visible')
    }
    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
      // Snap to the real pointer on first move so the dot never flies in
      // from off-screen and never sits at a stale position.
      if (!visible) {
        x = tx
        y = ty
        rx = tx
        ry = ty
      }
      show()
      const t = (e.target as HTMLElement).closest?.('[data-cursor], a, button') as HTMLElement | null
      const next = t?.dataset?.cursor ?? (t ? 'OPEN' : '')
      if (next !== label) {
        label = next
        dot.classList.toggle('is-active', Boolean(next))
        ring?.classList.toggle('is-active', Boolean(next))
        if (labelRef.current) labelRef.current.textContent = next
      }
      dot.classList.toggle('is-link', Boolean(t) && !next)
    }

    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    document.body.classList.add('has-cursor')
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', hide)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor" ref={dotRef} aria-hidden="true">
        <span className="cursor__label" ref={labelRef} />
      </div>
    </>
  )
}
