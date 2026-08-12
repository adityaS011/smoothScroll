/**
 * The shape of roadmap content. Every `x`/`y` is a percentage of its panel,
 * never a pixel. Ids are stable, unique roadmap-wide, and independent of the
 * text — so rewording never breaks a connection.
 */

export type PanelWord = {
  id: string
  text: string
  x: number
  y: number
}

/**
 * A row word holds together on one line by default, so a two-word phrase like
 * "your body" never splits down the middle. `wrap` opts a long phrase out of
 * that, for when the phrase alone is wider than a phone.
 */
export type RowWord = { id: string; text: string; wrap?: boolean }

/**
 * Words on one line, spaced by flex — so the gap survives a change of copy,
 * which a hand-placed `x` would not. `gapScale` widens it, and with it the
 * line drawn across.
 */
export type WordRow = {
  x: number
  y: number
  gapScale?: number
  words: RowWord[]
}

export type Panel = {
  id: number
  image: string
  focal?: string // object-position, defaults to 'center 30%'
  words?: PanelWord[]
  rows?: WordRow[]
  headline?: string // a centered statement instead of words
  frame?: boolean // the circle-and-crosshair instrument frame
}

/** `curve` bends the line: magnitude bows it out, sign picks the side. */
export type Connection = {
  from: string
  to: string
  curve?: number
}
