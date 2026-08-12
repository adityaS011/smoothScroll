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
}

// A horizontal row of words, laid out with one consistent gap (flex) and
// centered on (x, y). Guarantees identical spacing between words everywhere.
export type RowWord = { id: string; text: string }
export type WordRow = {
  x: number       // % — horizontal center of the row
  y: number       // % — vertical center of the row
  words: RowWord[]
}

export type PanelTint = 'blue' | 'transition' | 'orange'

export type Panel = {
  id: number
  image: string       // path to a local image under /public
  focal?: string      // object-position, defaults to 'center 30%'
  tint: PanelTint
  words: PanelWord[]  // individually placed words (scattered singles)
  rows?: WordRow[]    // evenly-spaced word rows
  headline?: string   // if set, the panel is a centered statement (no words)
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
 * Panel 1 (intro title) — plain white background with live headline text
 * (rendered by RoadmapSection, fades on scroll like the words).
 */
export const introPanel = {
  id: 0,
  tint: 'blue' as const,
  headline: "Your health doesn't move in straight lines.",
}

/**
 * Panel N (closing) — live headline over orange4.jpg.
 */
export const closingPanel = {
  id: 999,
  tint: 'orange' as const,
  headline: 'Shaped by your psychology',
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
    words: [],
    rows: [
      {
        x: 50,
        y: 48,
        words: [
          { id: 'your', text: 'your' },
          { id: 'body', text: 'body' },
          { id: 'is', text: 'is' },
          { id: 'talking', text: 'talking' },
        ],
      },
    ],
  },

  // ── Panel 2 — BLUE (deeper) ────────────────────────────────────
  // Phrase repeats over the silk, then a curve carries down to BUT MOST.
  {
    id: 2,
    image: '/blue2.jpg',
    focal: 'center center',
    tint: 'blue',
    words: [{ id: 'but-most', text: 'BUT MOST', x: 33, y: 68 }],
    rows: [
      {
        x: 50,
        y: 25,
        words: [
          { id: 'b2-body', text: 'your body' },
          { id: 'b2-talking', text: 'is talking' },
        ],
      },
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

  // ── Panel 4 — ORANGE 1 — centered statement ───────────────────
  {
    id: 4,
    image: '/orange1.jpg',
    focal: 'center 40%',
    tint: 'orange',
    words: [],
    headline: 'So we built one that has',
  },

  // ── Panel 5 — ORANGE 2 — two rows joined by a diagonal ─────────
  {
    id: 5,
    image: '/orange2.jpg',
    focal: 'center 30%',
    tint: 'orange',
    words: [],
    rows: [
      {
        x: 56,
        y: 32,
        words: [
          { id: 'o-every', text: 'EVERY' },
          { id: 'o-insight', text: 'INSIGHT' },
          { id: 'o-informed', text: 'INFORMED' },
        ],
      },
      {
        x: 42,
        y: 64,
        words: [
          { id: 'o-by', text: 'BY' },
          { id: 'o-what', text: 'WHAT' },
          { id: 'o-comes', text: 'COMES' },
          { id: 'o-next', text: 'NEXT' },
        ],
      },
    ],
  },

  // ── Panel 6 — ORANGE 3 — "WHERE EVERY SESSION COMPOUNDS —— ON THE LAST"
  {
    id: 6,
    image: '/orange3.jpg',
    focal: 'center 25%',
    tint: 'orange',
    words: [{ id: 'o-onthelast', text: 'ON\nTHE LAST', x: 80, y: 48 }],
    rows: [
      {
        x: 43,
        y: 48,
        words: [
          { id: 'o-where', text: 'WHERE' },
          { id: 'o-every2', text: 'EVERY' },
          { id: 'o-session', text: 'SESSION' },
          { id: 'o-compounds', text: 'COMPOUNDS' },
        ],
      },
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
  { from: 'o-insight', to: 'o-comes' },                // orange2: diagonal, top row -> bottom row
  { from: 'o-compounds', to: 'o-onthelast' },          // orange3: —— ON THE LAST
]

/** Convenience: total number of panels including intro + closing */
export const TOTAL_PANEL_COUNT = 1 + panels.length + 1  // intro + 6 + closing
