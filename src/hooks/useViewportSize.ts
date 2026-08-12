'use client'

import { useEffect, useState, type RefObject } from 'react'

export type ViewportSize = { width: number; height: number }

/**
 * The size of a pinned element, in CSS pixels.
 *
 * Height comes from `window.innerHeight`, not the element: a dvh-sized box can
 * round differently and leave a seam under every full-bleed image. Width comes
 * from the element, which excludes the scrollbar.
 */
export function useViewportSize(ref: RefObject<HTMLElement | null>): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      const height = window.innerHeight
      // Stable identity when nothing changed — callers use this to re-measure.
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    }

    update()
    window.addEventListener('resize', update)
    const observer = new ResizeObserver(update)
    observer.observe(el)

    return () => {
      window.removeEventListener('resize', update)
      observer.disconnect()
    }
  }, [ref])

  return size
}
