import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

export const TOTAL_FRAMES = 37 // frame_000 .. frame_036 (036 === 000)
const LAST_INDEX = TOTAL_FRAMES - 1

/* Single-request sprite: 2304x3584, 6 cols x 7 rows, 384x512 cells.
   Row-major: index i -> col i%6, row floor(i/6). Verified vs PNG frames. */
const SPRITE_URL = '/spritesheet/turntable_spritesheet.webp'
const SPRITE_COLS = 6
const CELL_W = 384
const CELL_H = 512

const frameUrl = (i: number) =>
  `/frames/frame_${String(i).padStart(3, '0')}.png`

export interface TurntableHandle {
  /** Draw a specific frame. Index is clamped to [0, 36]. */
  setFrame: (index: number) => void
}

interface Props {
  /** 0..1 load progress across critical hero assets. */
  onProgress?: (progress: number) => void
  /** Fired once the first paintable frame is ready (sprite or frame_000). */
  onReady?: () => void
  className?: string
}

const clampIndex = (i: number) =>
  Math.min(LAST_INDEX, Math.max(0, Math.round(i)))

const TurntableCanvas = forwardRef<TurntableHandle, Props>(
  ({ onProgress, onReady, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const spriteRef = useRef<HTMLImageElement | null>(null)
    const fallbackRef = useRef<HTMLImageElement[]>([])
    const fallbackLoadedRef = useRef<boolean[]>([])
    const frameRef = useRef(0)
    const rafRef = useRef(0)
    const drawnRef = useRef(-1)
    const readyFiredRef = useRef(false)
    const onProgressRef = useRef(onProgress)
    const onReadyRef = useRef(onReady)
    onProgressRef.current = onProgress
    onReadyRef.current = onReady

    const fireReady = () => {
      if (readyFiredRef.current) return
      readyFiredRef.current = true
      onProgressRef.current?.(1)
      onReadyRef.current?.()
    }

    // Draw current frame. Backing store matches the CSS box exactly
    // (same 3:4 aspect), so a full-bleed blit keeps scale/framing fixed.
    const draw = () => {
      rafRef.current = 0
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d', { alpha: false })
      if (!canvas || !ctx) return

      const idx = frameRef.current
      const sprite = spriteRef.current
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        if (idx === drawnRef.current) return
        drawnRef.current = idx
        const sx = (idx % SPRITE_COLS) * CELL_W
        const sy = Math.floor(idx / SPRITE_COLS) * CELL_H
        ctx.drawImage(
          sprite, sx, sy, CELL_W, CELL_H,
          0, 0, canvas.width, canvas.height,
        )
        return
      }

      // Fallback: nearest loaded PNG so scrubbing never flashes blank.
      const imgs = fallbackRef.current
      const loaded = fallbackLoadedRef.current
      let pick = idx
      if (!loaded[pick]) {
        let found = -1
        for (let d = 1; d < TOTAL_FRAMES; d++) {
          if (loaded[pick - d]) { found = pick - d; break }
          if (loaded[pick + d]) { found = pick + d; break }
        }
        if (found === -1) return
        pick = found
      }
      if (pick === drawnRef.current) return
      drawnRef.current = pick
      ctx.drawImage(imgs[pick], 0, 0, canvas.width, canvas.height)
    }

    const scheduleDraw = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(draw)
    }

    // Size backing store to DPR (capped; lower on small screens).
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const small = window.innerWidth < 700
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (w === canvas.width && h === canvas.height) return
      canvas.width = w
      canvas.height = h
      drawnRef.current = -1 // force redraw at new size
      scheduleDraw()
    }

    useImperativeHandle(ref, () => ({
      setFrame: (index: number) => {
        const next = clampIndex(index)
        if (next === frameRef.current && drawnRef.current === next) return
        frameRef.current = next
        scheduleDraw()
      },
    }), [])

    useEffect(() => {
      let cancelled = false
      const canvas = canvasRef.current
      onProgressRef.current?.(0.05)

      const loadFallbackPngs = () => {
        // Critical frames first, rest in idle-time chunks (no main-thread jank).
        const order: number[] = [0, 9, 18, 27, 36, 4, 13, 22, 31]

        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!order.includes(i)) order.push(i)
        }
        fallbackLoadedRef.current = new Array(TOTAL_FRAMES).fill(false)
        fallbackRef.current = new Array(TOTAL_FRAMES)
        let settled = 0
        const settleOne = (i: number, img: HTMLImageElement, ok: boolean) => {
          if (cancelled || fallbackLoadedRef.current[i]) return
          fallbackLoadedRef.current[i] = ok
          if (ok) fallbackRef.current[i] = img
          settled++
          onProgressRef.current?.(0.1 + (0.9 * settled) / TOTAL_FRAMES)
          if (i === 0 && ok) {
            frameRef.current = 0
            drawnRef.current = -1
            draw()
            fireReady()
          } else if (settled === TOTAL_FRAMES && !readyFiredRef.current) {
            console.error(
              '[turntable] sprite and frame_000 failed; canvas cannot paint.',
            )
          }
        }

        const loadAt = (pos: number) => {
          if (cancelled || pos >= order.length) return
          const i = order[pos]
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => settleOne(i, img, true)
          img.onerror = () => {
            console.error(`[turntable] failed to load ${frameUrl(i)}`)
            settleOne(i, img, false)
          }
          img.src = frameUrl(i)
          const next = () => loadAt(pos + 1)
          const w = window as Window & {
            requestIdleCallback?: (cb: () => void) => number
          }
          if (w.requestIdleCallback) w.requestIdleCallback(next)
          else setTimeout(next, 0)
        }
        loadAt(0)
      }

      // Primary: one 871KB WebP request, GPU-warmed via decode().
      const sprite = new Image()
      sprite.decoding = 'async'
      sprite.onload = () => {
        if (cancelled) return
        spriteRef.current = sprite
        frameRef.current = 0
        drawnRef.current = -1
        resize()
        draw()
        fireReady()
      }
      sprite.onerror = () => {
        if (cancelled) return
        console.error(
          `[turntable] failed to load ${SPRITE_URL}; using PNG frames.`,
        )
        spriteRef.current = null
        loadFallbackPngs()
      }
      sprite.src = SPRITE_URL
      try {
        const d = sprite.decode?.()
        d?.catch(() => undefined)
      } catch { /* onload still fires */ }

      resize()
      const ro = new ResizeObserver(resize)
      if (canvas) ro.observe(canvas)

      return () => {
        cancelled = true
        ro.disconnect()
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
        sprite.onload = null
        sprite.onerror = null
        sprite.src = ''
        spriteRef.current = null
        fallbackRef.current.forEach((img) => {
          if (img) {
            img.onload = null
            img.onerror = null
            img.src = ''
          }
        })
        fallbackRef.current = []
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className={className}
        role="img"
        aria-label="360-degree portrait of ravikumar gupta, a full-stack developer, rotating as you scroll."
      />
    )
  },
)

TurntableCanvas.displayName = 'TurntableCanvas'
export default TurntableCanvas
