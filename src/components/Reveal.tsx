import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** vertical travel in px (only used by the default 'up' variant) */
  y?: number
  delay?: number
  as?: 'div' | 'p' | 'h2' | 'h3' | 'li' | 'span' | 'ul'
  /** entrance direction — varies motion per section */
  from?: 'up' | 'left' | 'right' | 'scale' | 'clip'
}

/** Purpose-driven line reveal: animates in once when scrolled into view. */
export default function Reveal({
  children,
  className,
  style,
  y = 36,
  delay = 0,
  as = 'div',
  from = 'up',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const FROM: Record<NonNullable<Props['from']>, gsap.TweenVars> = {
      up: { y, autoAlpha: 0 },
      left: { x: -48, autoAlpha: 0 },
      right: { x: 48, autoAlpha: 0 },
      scale: { scale: 0.92, autoAlpha: 0 },
      clip: { clipPath: 'inset(0 0 100% 0)', autoAlpha: 1 },
    }
    const TO: Record<NonNullable<Props['from']>, gsap.TweenVars> = {
      up: { y: 0 },
      left: { x: 0 },
      right: { x: 0 },
      scale: { scale: 1 },
      clip: { clipPath: 'inset(0 0 0% 0)' },
    }
    const tween = gsap.fromTo(el, FROM[from], {
      ...TO[from],
      autoAlpha: 1,
      duration: 0.9,
      delay,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [y, delay, from])

  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
