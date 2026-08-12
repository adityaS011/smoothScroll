import type { Connection, Panel } from '../types'

const inRange = (n: number) => n >= 0 && n <= 100

/**
 * Dev-time check for what this data shape otherwise fails silently on: a
 * mistyped connection simply doesn't draw, and a duplicate id quietly points
 * a line at the wrong word.
 *
 * Takes its data as arguments rather than importing it, so the data file can
 * call this without the two importing each other.
 */
export function validateRoadmap(panels: Panel[], connections: Connection[]) {
  const problems: string[] = []
  const wordIds = new Set<string>()
  const panelIds = new Set<number>()

  const claimId = (id: string, where: string) => {
    if (wordIds.has(id)) {
      problems.push(`duplicate word id "${id}" (${where}) — lines will attach to the wrong word`)
    }
    wordIds.add(id)
  }

  for (const panel of panels) {
    if (panelIds.has(panel.id)) problems.push(`duplicate panel id ${panel.id}`)
    panelIds.add(panel.id)

    for (const w of panel.words ?? []) {
      claimId(w.id, `panel ${panel.id}`)
      if (!inRange(w.x) || !inRange(w.y)) {
        problems.push(`"${w.id}" is at ${w.x},${w.y} — outside 0–100`)
      }
    }

    panel.rows?.forEach((row, ri) => {
      if (!inRange(row.x) || !inRange(row.y)) {
        problems.push(`panel ${panel.id} row ${ri} is at ${row.x},${row.y} — outside 0–100`)
      }
      for (const w of row.words) claimId(w.id, `panel ${panel.id} row ${ri}`)
    })
  }

  const pairs = new Set<string>()
  for (const c of connections) {
    const key = `${c.from} -> ${c.to}`
    if (pairs.has(key)) problems.push(`duplicate connection ${key}`)
    pairs.add(key)
    if (c.from === c.to) problems.push(`connection ${key} links a word to itself`)
    for (const end of [c.from, c.to]) {
      if (!wordIds.has(end)) problems.push(`connection ${key} names "${end}", which is not a word`)
    }
  }

  if (problems.length > 0) {
    console.error(`roadmap data: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`)
  }
}
