import { useEffect, useRef, useState } from 'react'

interface Props {
  to: number
  suffix?: string
  duration?: number
}

/** Counts 0→`to` once when scrolled into view. Static final value under
 *  reduced-motion and before hydration (no fake motion, no layout shift). */
export default function CountUp({ to, suffix = '', duration = 1200 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(to)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    setN(0)
    let raf = 0
    let started = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const step = (t: number) => {
          if (!started) started = t
          const p = Math.min(1, (t - started) / duration)
          setN(Math.round((1 - Math.pow(1 - p, 3)) * to)) // easeOutCubic
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}
