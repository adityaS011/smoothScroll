'use client'

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { connections, panels, introPanel, closingPanel } from './roadmap-data'

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

// A word is fully visible within REVEAL_FULL of the viewport center (as a
// fraction of viewport height), then fades to nothing by REVEAL_END. Larger
// values make words linger longer on screen. Still a pure function of scroll.
const REVEAL_FULL = 0.24
const REVEAL_END = 0.48

// Shared word type: small, tracked, centered. One gap value drives spacing
// in every row so it's identical everywhere and scales with the viewport.
const WORD_GAP = 'clamp(0.75rem, 3.4vw, 3.25rem)'
const WORD_TEXT_STYLE: CSSProperties = {
  fontSize: 'clamp(0.72rem, 0.95vw, 0.95rem)',
  letterSpacing: '0.22em',
  fontWeight: 500,
  textAlign: 'center',
}

// A measured word box in strip coordinates (center + half-size), used for
// connector geometry so lines meet the words wherever flex lays them out.
type WordBox = { cx: number; cy: number; hw: number; hh: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

// A word (or connector endpoint) at strip-Y `cy` is fully visible within
// REVEAL_FULL of the viewport center and fully faded by REVEAL_END.
function wordOpacityAt(cy: number, viewportCenter: number, viewportH: number) {
  const distanceFrac = Math.abs(cy - viewportCenter) / viewportH
  return clamp01(1 - (distanceFrac - REVEAL_FULL) / (REVEAL_END - REVEAL_FULL))
}

// Words that a line points at. Their reveal is held back until the line has
// drawn all the way to them, so the flow reads: word → line → word.
const destinationIds = new Set(connections.map((c) => c.to))

// Reveal for a word. Plain words fade with distance. Destination words stay
// hidden on the way in until the line reaches them (~REVEAL_FULL below the
// center, where the line finishes drawing), then fade in; on the way out they
// fade like any other word.
function wordReveal(cy: number, viewportCenter: number, viewportH: number, isDestination: boolean) {
  if (!isDestination) return wordOpacityAt(cy, viewportCenter, viewportH)
  const signed = (cy - viewportCenter) / viewportH
  if (signed < 0) return wordOpacityAt(cy, viewportCenter, viewportH)
  return clamp01((REVEAL_FULL - signed) / 0.15)
}

export function RoadmapSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [viewportH, setViewportH] = useState(0)
  const [viewportW, setViewportW] = useState(0)

  // Each word's measured box in strip coordinates, keyed by id — used to run
  // connector lines to wherever flex actually laid the words out. Remeasured
  // on resize.
  const wordEls = useRef(new Map<string, HTMLElement | null>())
  const [wordBoxes, setWordBoxes] = useState<Map<string, WordBox>>(new Map())

  // Size the strip from window.innerHeight (the real viewport) and pin the
  // sticky container to that same pixel height. Measuring dvh off the sticky
  // could drift from innerHeight and leave a gap under each image; driving
  // both from one value keeps images filling the viewport exactly. Width is
  // the container's content width (excludes the scrollbar).
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const update = () => {
      setViewportH(window.innerHeight)
      setViewportW(el.clientWidth)
    }
    update()
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = sectionRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const scrollable = rect.height - (stickyRef.current?.clientHeight ?? window.innerHeight)
        const p = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0
        setProgress(p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Measure each word's box in strip coordinates once the strip has laid out,
  // and on every resize. Subtracting the strip's own rect cancels its scroll
  // transform, giving stable strip-local coordinates.
  useEffect(() => {
    if (!viewportW || !viewportH) return
    const measure = () => {
      const strip = stripRef.current
      if (!strip) return
      const sr = strip.getBoundingClientRect()
      const next = new Map<string, WordBox>()
      wordEls.current.forEach((el, id) => {
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
    // Web fonts can reflow the words after the first measure — re-measure once
    // they're ready so the connectors stay pinned to the words.
    document.fonts?.ready.then(() => requestAnimationFrame(measure))
    return () => cancelAnimationFrame(raf)
  }, [viewportW, viewportH])

  const stripHeight = PANEL_TOTAL * viewportH
  const translateY = progress * (PANEL_TOTAL - 1) * viewportH

  return (
    <section ref={sectionRef} style={{ height: `${OUTER_HEIGHT_VH}vh` }} className="relative bg-black">
      <div
        ref={stickyRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: viewportH ? `${viewportH}px` : '100dvh' }}
      >
        {viewportH > 0 && (
          <div
            ref={stripRef}
            className="absolute left-0 top-0 w-full will-change-transform"
            style={{ height: `${stripHeight}px`, transform: `translate3d(0, ${-translateY}px, 0)` }}
          >
            <BackgroundLayer viewportH={viewportH} />

            {/* Intro headline — live dark text on the white panel. */}
            <TitlePanel
              index={0}
              headline={introPanel.headline}
              viewportH={viewportH}
              stripTranslateY={translateY}
              dark
            />

            {/* Line under words so words always sit on top of any grazing. */}
            <LineLayer
              viewportW={viewportW}
              viewportH={viewportH}
              stripTranslateY={translateY}
              wordBoxes={wordBoxes}
            />
            <WordsLayer
              viewportH={viewportH}
              stripTranslateY={translateY}
              registerRef={(id, el) => wordEls.current.set(id, el)}
            />

            {/* Mid-sequence statement panels (e.g. orange 1 & 4). */}
            {panels.map((panel, i) =>
              panel.headline ? (
                <TitlePanel
                  key={`stmt-${panel.id}`}
                  index={i + 1}
                  headline={panel.headline}
                  viewportH={viewportH}
                  stripTranslateY={translateY}
                  word
                />
              ) : null,
            )}

            <TitlePanel
              index={PANEL_TOTAL - 1}
              headline={closingPanel.headline}
              viewportH={viewportH}
              stripTranslateY={translateY}
              word
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
      {/* Intro: plain white background; the headline is live text, not baked. */}
      <div className="absolute left-0 w-full bg-white" style={{ top: 0, height: viewportH }} />
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

// ── Title panels — a centered statement that fades on scroll like the words.
// `dark` = dark text (white intro panel). `word` = small tracked word-style
// type (used by the orange statement panels) instead of the big italic head.
function TitlePanel({
  index,
  headline,
  viewportH,
  stripTranslateY,
  dark = false,
  word = false,
}: {
  index: number
  headline: string
  viewportH: number
  stripTranslateY: number
  dark?: boolean
  word?: boolean
}) {
  const centerY = index * viewportH + viewportH / 2
  const opacity = wordOpacityAt(centerY, stripTranslateY + viewportH / 2, viewportH)
  const color = dark ? 'text-neutral-900' : 'text-white'

  return (
    <div
      className="absolute left-0 w-full flex items-center justify-center px-6 text-center"
      style={{ top: index * viewportH, height: viewportH, opacity }}
    >
      <h2
        className={`max-w-3xl ${color} ${word ? 'font-medium uppercase' : 'italic font-bold'}`}
        style={
          word
            ? { fontSize: 'clamp(0.72rem, 0.95vw, 0.95rem)', letterSpacing: '0.22em', lineHeight: 1.6 }
            : { fontSize: 'clamp(1.75rem, 4.5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }
        }
      >
        {headline}
      </h2>
    </div>
  )
}

// A single word span (used both as an absolute single and as a flex-row item).
function Word({
  id,
  text,
  registerRef,
  style,
}: {
  id: string
  text: string
  registerRef: (id: string, el: HTMLElement | null) => void
  style?: CSSProperties
}) {
  return (
    <span
      ref={(el) => registerRef(id, el)}
      className="text-white select-none pointer-events-none"
      style={{ ...WORD_TEXT_STYLE, whiteSpace: text.includes('\n') ? 'pre-line' : 'nowrap', ...style }}
    >
      {text}
    </span>
  )
}

// ── Words — scattered singles + evenly-spaced rows, fading by distance ────
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

  return (
    <>
      {panels.map((panel, panelIndex) => {
        const panelTop = (panelIndex + 1) * viewportH
        return (
          <Fragment key={panel.id}>
            {panel.words.map((w) => {
              const wordY = panelTop + (w.y / 100) * viewportH
              return (
                <Word
                  key={w.id}
                  id={w.id}
                  text={w.text}
                  registerRef={registerRef}
                  style={{
                    position: 'absolute',
                    left: `${w.x}%`,
                    top: wordY,
                    transform: 'translate(-50%, -50%)',
                    opacity: wordReveal(wordY, viewportCenter, viewportH, destinationIds.has(w.id)),
                  }}
                />
              )
            })}
            {(panel.rows ?? []).map((row, ri) => {
              const rowY = panelTop + (row.y / 100) * viewportH
              return (
                <div
                  key={`row-${panel.id}-${ri}`}
                  className="absolute flex items-center"
                  style={{ left: `${row.x}%`, top: rowY, transform: 'translate(-50%, -50%)', gap: WORD_GAP }}
                >
                  {row.words.map((w) => (
                    <Word
                      key={w.id}
                      id={w.id}
                      text={w.text}
                      registerRef={registerRef}
                      style={{ opacity: wordReveal(rowY, viewportCenter, viewportH, destinationIds.has(w.id)) }}
                    />
                  ))}
                </div>
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
}

// ── Lines — one clean segment per named connection ───────────────────────
type Segment = { key: string; d: string; fromY: number; toY: number }

// Distance from a word's center to its bounding-box edge along a unit
// direction — so a line can start/end exactly at the edge.
function boxExit(hw: number, hh: number, ux: number, uy: number) {
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity
  return Math.min(tx, ty)
}

function buildSegments(boxes: Map<string, WordBox>): Segment[] {
  const GAP = 10
  const segments: Segment[] = []
  for (const c of connections) {
    const a = boxes.get(c.from)
    const b = boxes.get(c.to)
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

    segments.push({ key: `${c.from}->${c.to}`, d, fromY: a.cy, toY: b.cy })
  }
  return segments
}

function LineLayer({
  viewportW,
  viewportH,
  stripTranslateY,
  wordBoxes,
}: {
  viewportW: number
  viewportH: number
  stripTranslateY: number
  wordBoxes: Map<string, WordBox>
}) {
  const pathEls = useRef(new Map<string, SVGPathElement | null>())
  const [lengths, setLengths] = useState<Map<string, number>>(new Map())

  const segments = useMemo(() => buildSegments(wordBoxes), [wordBoxes])

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
  const viewportCenter = stripTranslateY + viewportH / 2

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: '100%', height: stripHeight }}
      viewBox={`0 0 ${viewportW} ${stripHeight}`}
      preserveAspectRatio="none"
    >
      {segments.map((s) => {
        const len = lengths.get(s.key) ?? 0

        // Visible while either endpoint is on screen, so it can draw toward a
        // destination word that hasn't revealed yet (the word waits for the
        // line). It never stubs off-screen because an undrawn line has its
        // full length dashed away below.
        const opacity = Math.max(
          wordOpacityAt(s.fromY, viewportCenter, viewportH),
          wordOpacityAt(s.toY, viewportCenter, viewportH),
        )

        // Draws toward its destination word: fully drawn once the to-word
        // reaches its visible zone, un-drawn while it's still far below.
        // Pure function of scroll, symmetric on the way back up.
        const toDistBelow = (s.toY - viewportCenter) / viewportH
        const drawFrac = clamp01(1 - (toDistBelow - REVEAL_FULL) / (REVEAL_END - REVEAL_FULL))
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
            opacity={opacity}
            strokeDasharray={len || 9999}
            strokeDashoffset={len ? dashOffset : 9999}
          />
        )
      })}
    </svg>
  )
}
