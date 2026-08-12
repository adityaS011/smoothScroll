'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { ViewportSize } from '@/hooks/useViewportSize'
import type { WordBox } from './model/connectors'

/**
 * Measures where the browser actually put each word, in strip coordinates.
 * This is what lets connectors be responsive without pixel coordinates.
 */
export function useWordBoxes(stripRef: RefObject<HTMLElement | null>, size: ViewportSize) {
  const els = useRef(new Map<string, HTMLElement | null>())
  const [wordBoxes, setWordBoxes] = useState<Map<string, WordBox>>(new Map())

  // Stable, so a word's ref isn't detached and reattached on every frame.
  const registerWord = useCallback((id: string, el: HTMLElement | null) => {
    els.current.set(id, el)
  }, [])

  useEffect(() => {
    if (!size.width || !size.height) return

    const measure = () => {
      const strip = stripRef.current
      if (!strip) return
      // Subtracting the strip's own rect cancels its scroll transform.
      const sr = strip.getBoundingClientRect()
      const next = new Map<string, WordBox>()
      els.current.forEach((el, id) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        next.set(id, {
          cx: r.left - sr.left + r.width / 2,
          cy: r.top - sr.top + r.height / 2,
          hw: r.width / 2,
          hh: r.height / 2,
        })
      })
      setWordBoxes(next)
    }

    const raf = requestAnimationFrame(measure)
    // Web fonts reflow the words, so measure again once they land.
    document.fonts?.ready.then(() => requestAnimationFrame(measure))
    return () => cancelAnimationFrame(raf)
  }, [stripRef, size.width, size.height])

  return { registerWord, wordBoxes }
}
