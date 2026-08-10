/**
 * Roadmap panel data.
 *
 * Coordinate system:
 *   - Each panel is a 100vw × 100dvh slot
 *   - Words: `x` and `y` are % of the panel's width and height
 *
 * Connecting lines are NOT stored per panel. Instead `connections` names
 * pairs of words to link; the render layer draws exactly one clean line
 * per connection, stopping at each word's measured edge. Only named
 * connections produce a line — words with no connection have no line.
 */

export type PanelWord = {
  id: string      // stable, unique across the whole roadmap
  text: string
  x: number       // % of panel width (0–100)
  y: number       // % of panel height (0–100)
  size?: 'sm' | 'md' | 'lg'   // small=body, md=default, lg=hero (INSIGHT/ACTION)
}

export type PanelTint = 'blue' | 'transition' | 'orange'

export type Panel = {
  id: number
  image: string       // path to a local image under /public
  focal?: string      // object-position, defaults to 'center 30%'
  tint: PanelTint
  words: PanelWord[]
}

/**
 * A connecting line between two words (by id). Drawn as one segment that
 * stops at each word's edge. `curve` is an optional signed bend: 0/undefined
 * = straight; magnitude bows the line out perpendicular to the segment
 * (sign picks the side). Tune per connection.
 */
export type Connection = {
  from: string
  to: string
  curve?: number
}

/**
 * Panel 1 (intro title) — headline baked into white.jpg, no live text.
 */
export const introPanel = {
  id: 0,
  tint: 'blue' as const,
  headline: "Your health doesn't move in straight lines.",
  image: '/white.jpg',
  focal: 'center center',
}

/**
 * Panel N (closing) — live headline over orange4.jpg.
 */
export const closingPanel = {
  id: 999,
  tint: 'orange' as const,
  headline: 'and the ring stays quiet, until it matters.',
  image: '/orange4.jpg',
  focal: 'center center',
}

/**
 * Roadmap word panels. 6 panels between intro and closing.
 */
export const panels: Panel[] = [
  // ── Panel 1 — BLUE ─────────────────────────────────────────────
  {
    id: 1,
    image: '/blue1.jpg',
    focal: 'center 25%',
    tint: 'blue',
    words: [
      { id: 'your',    text: 'your',    x: 30, y: 48 },
      { id: 'body',    text: 'body',    x: 42, y: 48 },
      { id: 'is',      text: 'is',      x: 55, y: 48 },
      { id: 'talking', text: 'talking', x: 65, y: 48 },
    ],
  },

  // ── Panel 2 — BLUE (deeper) ────────────────────────────────────
  {
    id: 2,
    image: '/blue2.jpg',
    focal: 'center center',
    tint: 'blue',
    words: [
      // The phrase repeats here (over the silk bg) with its own line,
      // then the curve carries down to BUT MOST.
      { id: 'b2-body',    text: 'your body',    x: 35, y: 25 },
      { id: 'b2-talking', text: 'is talking', x: 60, y: 25 },
      { id: 'but-most',   text: 'BUT MOST', x: 33, y: 68 },
    ],
  },

  // ── Panel 3 — BLUE (HEALTH SYSTEMS / AREN'T LISTENING) ─────────
  {
    id: 3,
    image: '/blue3.jpg',
    focal: 'center center',
    tint: 'blue',
    words: [
      { id: 'health-systems',  text: 'HEALTH SYSTEMS',   x: 55, y: 30 },
      { id: 'arent-listening', text: 'AREN’T LISTENING', x: 40, y: 60 },
    ],
  },

  // ── Panel 4 — ORANGE ───────────────────────────────────────────
  {
    id: 4,
    image: '/orange1.jpg',
    focal: 'center 40%',
    tint: 'orange',
    words: [
      { id: 'patterns',   text: 'patterns',  x: 28, y: 30 },
      { id: 'signals',    text: 'signals',   x: 65, y: 30 },
      { id: 'insight-lg', text: 'INSIGHT',   x: 50, y: 55, size: 'lg' },
      { id: 'your-data',  text: 'your data', x: 35, y: 80 },
    ],
  },

  // ── Panel 5 — ORANGE ───────────────────────────────────────────
  {
    id: 5,
    image: '/orange2.jpg',
    focal: 'center 30%',
    tint: 'orange',
    words: [
      { id: 'turning', text: 'turning', x: 30, y: 30 },
      { id: 'noise',   text: 'noise',   x: 55, y: 30 },
      { id: 'into',    text: 'into',    x: 45, y: 55 },
      { id: 'knowing', text: 'knowing', x: 60, y: 75 },
    ],
  },

  // ── Panel 6 — ORANGE ───────────────────────────────────────────
  {
    id: 6,
    image: '/orange3.jpg',
    focal: 'center 25%',
    tint: 'orange',
    words: [
      { id: 'action',        text: 'ACTION',        x: 50, y: 30, size: 'lg' },
      { id: 'follows',       text: 'follows',       x: 35, y: 60 },
      { id: 'understanding', text: 'understanding', x: 55, y: 75 },
    ],
  },
]

/**
 * Connecting lines, in scroll order. Each links two words by id.
 * Blue section only for now; orange connections to be added next.
 */
export const connections: Connection[] = [
  { from: 'body', to: 'is' },                          // blue1: YOUR BODY —— IS TALKING
  { from: 'b2-body', to: 'b2-talking' },               // blue2: "your body —— is talking"
  { from: 'b2-talking', to: 'but-most', curve: -0.38 }, // blue2: curve down to BUT MOST
  { from: 'but-most', to: 'health-systems' },          // into blue3 (AREN'T LISTENING has no line)
]

/** Convenience: total number of panels including intro + closing */
export const TOTAL_PANEL_COUNT = 1 + panels.length + 1  // intro + 6 + closing
