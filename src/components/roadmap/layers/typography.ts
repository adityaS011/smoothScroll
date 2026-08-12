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

export const WORD_GAP = 'clamp(0.75rem, 3.4vw, 3.25rem)'
