import type { ReactNode } from 'react'
import { panelCenterY, wordOpacityAt, type StripView } from '../model/reveal'
import { WORD_TEXT_STYLE } from './typography'
import { StripPanel } from './StripPanel'

/**
 * Statements wear the same type as the words — only the ink changes: `intro`
 * is dark on the white opening panel, `statement` white over an image.
 */
export type TitleVariant = 'intro' | 'statement'

const INK: Record<TitleVariant, string> = {
  intro: 'text-neutral-900',
  statement: 'text-white',
}

/**
 * The statement itself, wherever a panel chooses to put it. `maxWidth` is for
 * framed panels, whose text has to stay inside the circle.
 */
export function Headline({
  variant,
  maxWidth,
  children,
}: {
  variant: TitleVariant
  maxWidth?: string
  children: ReactNode
}) {
  return (
    <h2
      className={`${maxWidth ? '' : 'max-w-3xl'} ${INK[variant]}`}
      style={{ ...WORD_TEXT_STYLE, lineHeight: 1.6, maxWidth }}
    >
      {children}
    </h2>
  )
}

/** Centers a headline in its panel, in either rendering. */
export const HEADLINE_BOX = 'flex items-center justify-center px-6 text-center'

/** A statement filling one panel, fading with distance like the words. */
export function TitlePanel({
  index,
  headline,
  view,
  variant,
  maxWidth,
}: {
  index: number
  headline: string
  view: StripView
  variant: TitleVariant
  maxWidth?: string
}) {
  return (
    <StripPanel
      index={index}
      panelHeight={`${view.viewportH}px`}
      className={HEADLINE_BOX}
      style={{ opacity: wordOpacityAt(panelCenterY(index, view.viewportH), view) }}
    >
      <Headline variant={variant} maxWidth={maxWidth}>
        {headline}
      </Headline>
    </StripPanel>
  )
}
