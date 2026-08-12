import { useMemo } from 'react'
import { buildSegments, type WordBox } from '../model/connectors'
import { PANEL_COUNT } from '../data'
import { lineDrawFrac, wordOpacityAt, type StripView } from '../model/reveal'

// In CSS pixels: the SVG has no viewBox, so this is the width you get.
const STROKE_WIDTH = 1.5

/**
 * `pathLength={1}` restates every path as one unit long, so the dash values
 * below are fractions of the line whatever its real length — nothing to
 * measure. The gap is wider than the dash so the pattern can't wrap and leave
 * a stray segment at the far end.
 *
 * With no `view` the lines are simply there, whole and still.
 */
export function ConnectorLayer({
  wordBoxes,
  view,
}: {
  wordBoxes: Map<string, WordBox>
  view?: StripView
}) {
  const segments = useMemo(() => buildSegments(wordBoxes), [wordBoxes])

  // No viewBox: user units are CSS pixels, which is what the boxes were
  // measured in.
  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: '100%', height: view ? PANEL_COUNT * view.viewportH : '100%' }}
    >
      {segments.map((s) => (
        <path
          key={s.key}
          d={s.d}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          // Visible while either end is, so it can draw toward a hidden word.
          opacity={view ? Math.max(wordOpacityAt(s.fromY, view), wordOpacityAt(s.toY, view)) : 1}
          pathLength={1}
          strokeDasharray="1 2"
          strokeDashoffset={view ? 1 - lineDrawFrac(s.toY, view) : 0}
        />
      ))}
    </svg>
  )
}
