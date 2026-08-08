'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { connections, panels, introPanel, closingPanel } from './roadmap-data'
import type { PanelWord } from './roadmap-data'

/**
 * Sticky scrollytelling: a tall outer section, a pinned viewport, and a
 * content strip that translates upward through it. Backgrounds, words and
 * connecting lines all live in the strip and scroll past the pinned viewport.
 *
 * Words fade in by distance from the viewport center. Connecting lines are
 * named in roadmap-data (`connections`); each draws itself in on scroll and
 * un-draws on scroll up, stopping cleanly at each word's measured edge.
 */

const PANEL_TOTAL = 1 + panels.length + 1
const OUTER_HEIGHT_VH = PANEL_TOTAL * 100

const REVEAL_TOP = 0.25
const REVEAL_BOTTOM = 0.75

// Every word flattened with the index of the panel it belongs to, so its
// position in the strip is (panelIndex + 1) × viewportH + y%.
type FlatWord = PanelWord & { panelIndex: number }
const allWords: FlatWord[] = panels.flatMap((panel, panelIndex) =>
  panel.words.map((w) => ({ ...w, panelIndex })),
)

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function RoadmapSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [viewportH, setViewportH] = useState(0)
  const [viewportW, setViewportW] = useState(0)

  // Measured word box sizes (px), keyed by word id — used to stop each line
  // at the word's edge. Remeasured on resize.
  const wordEls = useRef(new Map<string, HTMLElement | null>())
  const [wordSizes, setWordSizes] = useState<Map<string, { w: number; h: number }>>(new Map())

  useEffect(() => {
    const measure = () => {
      setViewportH(window.innerHeight)
      setViewportW(window.innerWidth)
    }
    measure()

    let raf = 0
    const tick = () => {
      const el = sectionRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const scrollable = rect.height - window.innerHeight
        const p = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0
        setProgress(p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Measure word widths once the strip has rendered, and on every resize.
  useEffect(() => {
    if (!viewportW || !viewportH) return
    const next = new Map<string, { w: number; h: number }>()
    wordEls.current.forEach((el, id) => {
      if (el) next.set(id, { w: el.offsetWidth, h: el.offsetHeight })
    })
    setWordSizes(next)
  }, [viewportW, viewportH])

  const stripHeight = PANEL_TOTAL * viewportH
  const translateY = progress * (PANEL_TOTAL - 1) * viewportH

  return (
    <section ref={sectionRef} style={{ height: `${OUTER_HEIGHT_VH}vh` }} className="relative bg-black">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        {viewportH > 0 && (
          <div
            className="absolute left-0 top-0 w-full will-change-transform"
            style={{ height: `${stripHeight}px`, transform: `translate3d(0, ${-translateY}px, 0)` }}
          >
            <BackgroundLayer viewportH={viewportH} />

            {/* Intro headline is baked into white.jpg, so no live TitlePanel here. */}

            {/* Line under words so words always sit on top of any grazing. */}
            <LineLayer
              viewportW={viewportW}
              viewportH={viewportH}
              stripTranslateY={translateY}
              wordSizes={wordSizes}
            />
            <WordsLayer
              viewportH={viewportH}
              stripTranslateY={translateY}
              registerRef={(id, el) => wordEls.current.set(id, el)}
            />

            <TitlePanel
              index={PANEL_TOTAL - 1}
              headline={closingPanel.headline}
              viewportH={viewportH}
              stripTranslateY={translateY}
            />
          </div>
        )}
      </div>
    </section>
  )
}

// ── Backgrounds — one image per panel, stacked vertically ────────────────
function BackgroundLayer({ viewportH }: { viewportH: number }) {
  return (
    <>
      {/* Intro: white.jpg (a designed light slide, no dark tint). */}
      <div className="absolute left-0 w-full" style={{ top: 0, height: viewportH }}>
        <Image
          src={introPanel.image}
          alt=""
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: introPanel.focal }}
        />
      </div>
      {panels.map((panel, i) => (
        <div
          key={panel.id}
          className="absolute left-0 w-full"
          style={{ top: (i + 1) * viewportH, height: viewportH }}
        >
          <Image
            src={panel.image}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            style={{ objectFit: 'cover', objectPosition: panel.focal ?? 'center 30%' }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      {/* Closing: orange4.jpg with a dark tint so the headline reads. */}
      <div
        className="absolute left-0 w-full"
        style={{ top: (PANEL_TOTAL - 1) * viewportH, height: viewportH }}
      >
        <Image
          src={closingPanel.image}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: closingPanel.focal }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </>
  )
}

// ── Title panels (closing only) ──────────────────────────────────────────
function TitlePanel({
  index,
  headline,
  viewportH,
  stripTranslateY,
}: {
  index: number
  headline: string
  viewportH: number
  stripTranslateY: number
}) {
  const centerY = index * viewportH + viewportH / 2
  const distanceFromViewportCenter = Math.abs(centerY - stripTranslateY - viewportH / 2)
  const opacity = Math.max(0, 1 - distanceFromViewportCenter / (viewportH * 0.5))

  return (
    <div
      className="absolute left-0 w-full flex items-center justify-center px-6 text-center"
      style={{ top: index * viewportH, height: viewportH, opacity }}
    >
      <h2
        className="max-w-3xl text-white italic font-bold"
        style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
      >
        {headline}
      </h2>
    </div>
  )
}

// ── Words — every word, absolutely positioned, fading by distance ────────
function WordsLayer({
  viewportH,
  stripTranslateY,
  registerRef,
}: {
  viewportH: number
  stripTranslateY: number
  registerRef: (id: string, el: HTMLElement | null) => void
}) {
  const viewportCenter = stripTranslateY + viewportH / 2
  const revealBand = (viewportH * (REVEAL_BOTTOM - REVEAL_TOP)) / 2

  return (
    <>
      {allWords.map((word) => {
        const wordY = (word.panelIndex + 1) * viewportH + (word.y / 100) * viewportH
        const distance = Math.abs(wordY - viewportCenter)
        const opacity = clamp01(1 - (distance - revealBand * 0.3) / (revealBand * 0.8))
        const isLarge = word.size === 'lg'

        return (
          <span
            key={word.id}
            ref={(el) => registerRef(word.id, el)}
            className="absolute text-white select-none pointer-events-none"
            style={{
              left: `${word.x}%`,
              top: wordY,
              transform: 'translate(-50%, -50%)',
              opacity,
              fontSize: isLarge ? 'clamp(1.5rem, 3.5vw, 2.75rem)' : 'clamp(0.72rem, 0.95vw, 0.95rem)',
              letterSpacing: isLarge ? '0.05em' : '0.22em',
              fontWeight: isLarge ? 700 : 500,
              fontStyle: isLarge ? 'italic' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            {word.text}
          </span>
        )
      })}
    </>
  )
}

// ── Lines — one clean segment per named connection ───────────────────────
type Segment = { key: string; d: string; midY: number }

// Distance from a word's center to its bounding-box edge along a unit
// direction — so a line can start/end exactly at the edge.
function boxExit(hw: number, hh: number, ux: number, uy: number) {
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity
  return Math.min(tx, ty)
}

function buildSegments(
  vw: number,
  vh: number,
  wordSizes: Map<string, { w: number; h: number }>,
): Segment[] {
  if (!vw || !vh) return []

  const geo = new Map<string, { cx: number; cy: number; hw: number; hh: number }>()
  for (const w of allWords) {
    const size = wordSizes.get(w.id)
    geo.set(w.id, {
      cx: (w.x / 100) * vw,
      cy: (w.panelIndex + 1) * vh + (w.y / 100) * vh,
      hw: (size?.w ?? 48) / 2,
      hh: (size?.h ?? 18) / 2,
    })
  }

  const GAP = 10
  const segments: Segment[] = []
  for (const c of connections) {
    const a = geo.get(c.from)
    const b = geo.get(c.to)
    if (!a || !b) continue

    const dx = b.cx - a.cx
    const dy = b.cy - a.cy
    const dist = Math.hypot(dx, dy) || 1
    const ux = dx / dist
    const uy = dy / dist

    const sx = a.cx + ux * (boxExit(a.hw, a.hh, ux, uy) + GAP)
    const sy = a.cy + uy * (boxExit(a.hw, a.hh, ux, uy) + GAP)
    const ex = b.cx - ux * (boxExit(b.hw, b.hh, ux, uy) + GAP)
    const ey = b.cy - uy * (boxExit(b.hw, b.hh, ux, uy) + GAP)

    let d: string
    if (c.curve) {
      const segLen = Math.hypot(ex - sx, ey - sy)
      const cpx = (sx + ex) / 2 + -uy * c.curve * segLen
      const cpy = (sy + ey) / 2 + ux * c.curve * segLen
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
    } else {
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`
    }

    segments.push({ key: `${c.from}->${c.to}`, d, midY: (sy + ey) / 2 })
  }
  return segments
}

function LineLayer({
  viewportW,
  viewportH,
  stripTranslateY,
  wordSizes,
}: {
  viewportW: number
  viewportH: number
  stripTranslateY: number
  wordSizes: Map<string, { w: number; h: number }>
}) {
  const pathEls = useRef(new Map<string, SVGPathElement | null>())
  const [lengths, setLengths] = useState<Map<string, number>>(new Map())

  const segments = useMemo(
    () => buildSegments(viewportW, viewportH, wordSizes),
    [viewportW, viewportH, wordSizes],
  )

  // Measure each path's length when geometry changes (mount / resize).
  useEffect(() => {
    const next = new Map<string, number>()
    for (const s of segments) {
      const el = pathEls.current.get(s.key)
      if (el) next.set(s.key, el.getTotalLength())
    }
    setLengths(next)
  }, [segments])

  const stripHeight = PANEL_TOTAL * viewportH

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: '100%', height: stripHeight }}
      viewBox={`0 0 ${viewportW} ${stripHeight}`}
      preserveAspectRatio="none"
    >
      {segments.map((s) => {
        const len = lengths.get(s.key) ?? 0
        // Draws in as the segment's midpoint rises through the lower part of
        // the viewport; un-draws on scroll back up. Pure function of scroll.
        const vpos = s.midY - stripTranslateY
        const drawFrac = clamp01((0.8 * viewportH - vpos) / (0.25 * viewportH))
        const dashOffset = len * (1 - drawFrac)

        return (
          <path
            key={s.key}
            ref={(el) => {
              pathEls.current.set(s.key, el)
            }}
            d={s.d}
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={len || 9999}
            strokeDashoffset={len ? dashOffset : 9999}
          />
        )
      })}
    </svg>
  )
}
