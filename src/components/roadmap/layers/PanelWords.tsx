import { useCallback, type CSSProperties } from 'react'
import type { Panel } from '../types'
import { WORD_GAP, WORD_TEXT_STYLE } from './typography'

export type RegisterWord = (id: string, el: HTMLElement | null) => void

export type OpacityOf = (yPercent: number, wordId: string) => number

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
            // max-content, or shrink-to-fit wraps early: the box is anchored
            // at x but centered on it, so it may use the nearer side twice.
            whiteSpace: 'pre-line',
            width: 'max-content',
            maxWidth: `${2 * Math.min(w.x, 100 - w.x)}%`,
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
            // A row centered at x may spread 2·min(x, 100−x) before running
            // off one side; past that it wraps rather than being clipped.
            maxWidth: `${2 * Math.min(row.x, 100 - row.x)}%`,
          }}
        >
          {row.words.map((w) => (
            <Word
              key={w.id}
              id={w.id}
              text={w.text}
              register={register}
              // Row items never break mid-phrase; the row wraps instead.
              style={{ opacity: opacityOf(row.y, w.id), whiteSpace: 'nowrap' }}
            />
          ))}
        </div>
      ))}
    </>
  )
}
