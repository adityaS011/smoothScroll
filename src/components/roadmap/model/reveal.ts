import { connections, panels } from '../data'

/**
 * Everything here is a pure function of where the strip sits, which is why
 * scrolling back up un-reveals with no state to rewind.
 */

/** Where the strip sits relative to the pinned viewport, in strip pixels. */
export type StripView = {
  viewportH: number
  centerY: number
}

/** Distances are fractions of viewport height, measured from its center. */
export const REVEAL_FULL = 0.24
export const REVEAL_END = 0.48
const FADE_IN_AFTER_LINE = 0.15

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const clampSigned = (x: number) => Math.min(1, Math.max(-1, x))

export const panelCenterY = (index: number, viewportH: number) => (index + 0.5) * viewportH

// Positive is below the viewport center, and so not yet reached.
const signedDistance = (cy: number, view: StripView) => (cy - view.centerY) / view.viewportH

// Rounded below what an eye can see, so a barely-moved frame produces an
// identical style and React writes nothing to the DOM.
const quantize = (x: number) => Math.round(x * 1000) / 1000

const ramp = (distance: number) =>
  quantize(clamp01(1 - (distance - REVEAL_FULL) / (REVEAL_END - REVEAL_FULL)))

export const wordOpacityAt = (cy: number, view: StripView) =>
  ramp(Math.abs(signedDistance(cy, view)))

// Signed, not absolute: a line past the center stays complete rather than
// un-drawing again.
export const lineDrawFrac = (toY: number, view: StripView) => ramp(signedDistance(toY, view))

export function wordReveal(cy: number, view: StripView, delayed: boolean) {
  const signed = signedDistance(cy, view)
  if (!delayed || signed < 0) return ramp(Math.abs(signed))
  return quantize(clamp01((REVEAL_FULL - signed) / FADE_IN_AFTER_LINE))
}

// ── Which words wait for a line ──────────────────────────────────────────

// A row is one phrase; a scattered word is a phrase of its own.
const phraseOf = new Map<string, string>()
for (const panel of panels) {
  for (const w of panel.words ?? []) phraseOf.set(w.id, `single:${w.id}`)
  panel.rows?.forEach((row, ri) => {
    for (const w of row.words) phraseOf.set(w.id, `row:${panel.id}:${ri}`)
  })
}

// A phrase waits for a line arriving from a *different* phrase, so the
// sequence reads phrase → line → phrase. A line within one delays nothing.
const phrasesAwaitingALine = new Set<string>()
for (const c of connections) {
  const from = phraseOf.get(c.from)
  const to = phraseOf.get(c.to)
  if (from && to && from !== to) phrasesAwaitingALine.add(to)
}

export function isDelayed(wordId: string) {
  const phrase = phraseOf.get(wordId)
  return phrase !== undefined && phrasesAwaitingALine.has(phrase)
}
