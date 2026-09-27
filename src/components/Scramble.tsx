import { useEffect, useRef } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#________'

/** Decode/scramble text on mount. Reduced-motion shows the final text at once. */
export default function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text
      return
    }
    const lock = (i: number) => 6 + i * 2.2 // frame at which char i settles
    let frame = 0
    let raf = 0
    const tick = () => {
      let out = ''
      let done = true
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ' || frame >= lock(i)) out += text[i]
        else { out += CHARS[Math.floor(Math.random() * CHARS.length)]; done = false }
      }
      el.textContent = out
      frame++
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text])

  return <span ref={ref} className={className}>{text}</span>
}
