import { useCallback, type CSSProperties } from 'react'
import type { Panel } from '../types'
import { WORD_GAP, WORD_TEXT_STYLE } from './typography'

export type RegisterWord = (id: string, el: HTMLElement | null) => void

export type OpacityOf = (yPercent: number, wordId: string) => number

/** Kept clear at both panel edges, so no word ever sits flush against one. */
const GUTTER = '2rem'

/**
 * A box anchored at `x` but centred on it may use the nearer side twice, so it
 * can spread 2·min(x, 100−x) before running off that edge. Past this it wraps
 * rather than being clipped.
 */
const spreadFrom = (x: number) => `calc(${2 * Math.min(x, 100 - x)}% - ${GUTTER})`

function Word({
  id,
  text,
  register,
  style,
}: {
  id: string
  text: string
  register: RegisterWord
  style?: CSSProperties
}) {
  // Stable per word, so the measuring map isn't rebuilt every frame.
  const ref = useCallback((el: HTMLElement | null) => register(id, el), [id, register])

  return (
    <span
      ref={ref}
      className="text-white select-none pointer-events-none"
      style={{ ...WORD_TEXT_STYLE, ...style }}
    >
      {text}
    </span>
  )
}

/**
 * One panel's words: scattered singles placed by percentage, rows laid out by
 * flex. Placement is panel-relative, which is why the scrolling and the
 * motionless renderings share it — they differ only in `opacityOf`.
 */
export function PanelWords({
  panel,
  register,
  opacityOf,
}: {
  panel: Panel
  register: RegisterWord
  opacityOf: OpacityOf
}) {
  return (
    <>
      {(panel.words ?? []).map((w) => (
        <Word
          key={w.id}
          id={w.id}
          text={w.text}
          register={register}
          style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: opacityOf(w.y, w.id),
            // max-content, or shrink-to-fit wraps early.
            whiteSpace: 'pre-line',
            width: 'max-content',
            maxWidth: spreadFrom(w.x),
          }}
        />
      ))}

      {(panel.rows ?? []).map((row, ri) => (
        <div
          key={`row-${panel.id}-${ri}`}
          className="absolute flex flex-wrap items-center justify-center"
          style={{
            left: `${row.x}%`,
            top: `${row.y}%`,
            transform: 'translate(-50%, -50%)',
            gap: row.gapScale ? `calc(${WORD_GAP} * ${row.gapScale})` : WORD_GAP,
            // Anchored at x with no `right`, shrink-to-fit would measure only
            // the space to the *right* of x — half the panel for a centred row
            // — and wrap far earlier than it needs to. max-content asks for the
            // whole line instead and lets maxWidth below be what actually caps.
            width: 'max-content',
            maxWidth: spreadFrom(row.x),
          }}
        >
          {row.words.map((w) => (
            <Word
              key={w.id}
              id={w.id}
              text={w.text}
              register={register}
              // The row wraps before a phrase does, so the break lands between
              // phrases rather than inside one — unless the phrase is too wide
              // for the panel on its own, which is what `wrap` is for.
              style={{ opacity: opacityOf(row.y, w.id), whiteSpace: w.wrap ? 'normal' : 'nowrap' }}
            />
          ))}
        </div>
      ))}
    </>
  )
}
