import type Lenis from 'lenis'

// App owns the single Lenis instance; expose it so the progress bar,
// back-to-top and any velocity effects reuse one smooth-scroll system.
// Null under reduced-motion (native scroll) or before mount.
let lenis: Lenis | null = null
export const setLenis = (l: Lenis | null) => {
  lenis = l
}

/** Smooth-scroll to a selector or Y offset; falls back to native scroll. */
export const scrollTo = (target: string | number) => {
  if (lenis) {
    lenis.scrollTo(target)
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
