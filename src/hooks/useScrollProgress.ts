'use client'

import { useEffect, useState, type RefObject } from 'react'

// Exponential time constant, in seconds. Wheel scroll arrives in discrete
// ~100px steps; chasing it turns those into continuous motion.
const DEFAULT_TAU = 0.1

const SETTLED = 0.00002
const START_TRACKING_WITHIN = '20% 0px'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/**
 * How far a sticky section has been scrolled through, 0 → 1, eased.
 *
 * The browser keeps the pinned element pinned either way, so only its
 * contents ease. The frame loop runs only while the section is near the
 * viewport — elsewhere on the page this hook costs nothing.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  pinnedHeight: number,
  tau = DEFAULT_TAU,
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let last = 0
    let smoothed = -1 // snap to the real position on the next frame

    const tick = (now: number) => {
      // Clamped so a backgrounded tab doesn't resume with one huge step.
      const dt = Math.min(now - last, 100) / 1000
      last = now

      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - (pinnedHeight || window.innerHeight)
      const target = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0

      // Damped by elapsed time rather than a fixed step, so 60 and 144Hz feel
      // the same.
      if (smoothed < 0) smoothed = target
      else smoothed += (target - smoothed) * (1 - Math.exp(-dt / tau))
      if (Math.abs(target - smoothed) < SETTLED) smoothed = target

      setProgress(smoothed)
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      smoothed = -1
    }

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: START_TRACKING_WITHIN },
    )
    observer.observe(el)

    return () => {
      stop()
      observer.disconnect()
    }
  }, [ref, pinnedHeight, tau])

  return progress
}
