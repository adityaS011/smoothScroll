import type { CSSProperties } from 'react'

/**
 * The roadmap's one type treatment, shared by words and statement panels.
 *
 * Word spacing isn't set: JetBrains Mono advances every glyph — the space
 * included — by 0.6em, and letter spacing adds 0.22em after it, so a word gap
 * is 0.82em. That's ~20px at the 24px size, and tighter as the type scales.
 */
export const WORD_TEXT_STYLE: CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  fontSize: 'clamp(0.875rem, 1.6vw, 1.5rem)',
  letterSpacing: '0.22em',
  fontWeight: 500,
  textTransform: 'uppercase',
  textAlign: 'center',
}

/**
 * The space a connector is drawn across, so it sets the line's length: the
 * line is this gap less the small clearance kept at each word's edge.
 *
 * The floor matters more than the ideal. At 3.4vw alone a phone left roughly
 * 40px between two words, and by the time both ends had their clearance the
 * line was a 20px stub. Starting at 1.75rem keeps it legible on a small
 * screen — vertically too, since this is also the gap a wrapped row stacks
 * across.
 */
export const WORD_GAP = 'clamp(1.75rem, 3.4vw, 3.25rem)'
