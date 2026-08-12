import type { Connection, Panel } from './types'
import { validateRoadmap } from './model/validate'

/**
 * Roadmap content, in scroll order. The sequence you read here is the
 * sequence on screen — which is why it stays one file. Shapes live in
 * types.ts; ids must be unique across every panel below.
 */

/** Intro — live headline on plain white. */
export const introPanel = {
  headline: "Your health doesn't move in straight lines.",
  frame: true,
}

/** Closing — live headline over a tinted image. */
export const closingPanel = {
  headline: 'Shaped by your psychology',
  image: '/orange4.jpg',
  focal: 'center center',
}

export const panels: Panel[] = [
  // 1 — blue
  {
    id: 1,
    image: '/blue1.jpg',
    focal: 'center 25%',
    frame: true,
    rows: [
      {
        x: 50,
        y: 48,
        gapScale: 3,
        // Two phrases, not four words — row gaps are uniform, so splitting per
        // word would space "your body" as widely as the connector does.
        words: [
          { id: 'b1-body', text: 'your body' },
          { id: 'b1-talking', text: 'is talking' },
        ],
      },
    ],
  },

  // 2 — blue, the phrase repeated, then a curve down to BUT MOST
  {
    id: 2,
    image: '/blue2.jpg',
    focal: 'center center',
    words: [{ id: 'but-most', text: 'BUT MOST', x: 33, y: 68 }],
    rows: [
      {
        x: 50,
        y: 25,
        gapScale: 3, // same phrase as panel 1, same spacing
        words: [
          { id: 'b2-body', text: 'your body' },
          { id: 'b2-talking', text: 'is talking' },
        ],
      },
    ],
  },

  // 3 — blue
  {
    id: 3,
    image: '/blue3.jpg',
    focal: 'center center',
    words: [
      { id: 'health-systems', text: 'HEALTH SYSTEMS', x: 55, y: 30 },
      { id: 'arent-listening', text: 'AREN’T LISTENING', x: 40, y: 60 },
    ],
  },

  // 4 — orange, a statement
  {
    id: 4,
    image: '/orange1.jpg',
    focal: 'center 40%',
    headline: 'So we built one that has',
  },

  // 5 — orange, two phrases on a diagonal
  {
    id: 5,
    image: '/orange2.jpg',
    focal: 'center 30%',
    words: [
      { id: 'o-insight', text: 'EVERY INSIGHT INFORMED', x: 56, y: 32 },
      { id: 'o-comes', text: 'BY WHAT COMES NEXT', x: 42, y: 64 },
    ],
  },

  // 6 — orange
  {
    id: 6,
    image: '/orange3.jpg',
    focal: 'center 25%',
    words: [
      { id: 'o-compounds', text: 'WHERE EVERY SESSION COMPOUNDS', x: 43, y: 48 },
      { id: 'o-onthelast', text: 'ON\nTHE LAST', x: 80, y: 48 },
    ],
  },
]

/** Every line on the roadmap, in scroll order. */
export const connections: Connection[] = [
  { from: 'b1-body', to: 'b1-talking' },
  { from: 'b2-body', to: 'b2-talking' },
  { from: 'b2-talking', to: 'but-most', curve: -0.38 },
  { from: 'but-most', to: 'health-systems' },
  { from: 'health-systems', to: 'arent-listening' },
  { from: 'o-insight', to: 'o-comes' },
  { from: 'o-compounds', to: 'o-onthelast' },
]

// A panel's index here is one less than its slot, since the intro holds slot 0.
export const PANEL_COUNT = 1 + panels.length + 1
export const INTRO_INDEX = 0
export const CLOSING_INDEX = PANEL_COUNT - 1

// Nothing above fails loudly on its own — a bad id just stops drawing. Shout
// about it while editing; costs nothing once built.
if (process.env.NODE_ENV !== 'production') validateRoadmap(panels, connections)
