import { connections } from '../data'

/** A measured word in strip coordinates: center plus half-size. */
export type WordBox = { cx: number; cy: number; hw: number; hh: number }

/** One drawable connection. `fromY`/`toY` drive its reveal timing. */
export type Segment = { key: string; d: string; fromY: number; toY: number }

type Vec = { x: number; y: number }

const EDGE_GAP = 10

const unit = (x: number, y: number): Vec => {
  const d = Math.hypot(x, y) || 1
  return { x: x / d, y: y / d }
}

/** Center-to-edge distance along a heading — which edge depends on the angle. */
function boxExit(hw: number, hh: number, ux: number, uy: number) {
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity
  return Math.min(tx, ty)
}

function endpoints(a: WordBox, b: WordBox, leaving: Vec, arriving: Vec) {
  const s = boxExit(a.hw, a.hh, leaving.x, leaving.y) + EDGE_GAP
  const e = boxExit(b.hw, b.hh, arriving.x, arriving.y) + EDGE_GAP
  return {
    sx: a.cx + leaving.x * s,
    sy: a.cy + leaving.y * s,
    ex: b.cx - arriving.x * e,
    ey: b.cy - arriving.y * e,
  }
}

function controlPoint(sx: number, sy: number, ex: number, ey: number, perp: Vec, curve: number) {
  const len = Math.hypot(ex - sx, ey - sy)
  return {
    x: (sx + ex) / 2 + perp.x * curve * len,
    y: (sy + ey) / 2 + perp.y * curve * len,
  }
}

/**
 * Measured words in, one SVG path per named connection out — so lines meet
 * the words wherever the browser laid them out, at any width.
 */
export function buildSegments(boxes: Map<string, WordBox>): Segment[] {
  const segments: Segment[] = []

  for (const c of connections) {
    const a = boxes.get(c.from)
    const b = boxes.get(c.to)
    if (!a || !b) continue

    const straight = unit(b.cx - a.cx, b.cy - a.cy)
    const perp = { x: -straight.y, y: straight.x }

    let { sx, sy, ex, ey } = endpoints(a, b, straight, straight)
    let d: string

    if (c.curve) {
      // A bow leaves and arrives on different headings than the straight line
      // does, and the heading is what picks the edge. Solving once with a
      // rough control point, then again against its tangents, stops a line
      // that sweeps in sideways from terminating on the word's top edge.
      const rough = controlPoint(sx, sy, ex, ey, perp, c.curve)
      const leaving = unit(rough.x - a.cx, rough.y - a.cy)
      const arriving = unit(b.cx - rough.x, b.cy - rough.y)
      ;({ sx, sy, ex, ey } = endpoints(a, b, leaving, arriving))

      const cp = controlPoint(sx, sy, ex, ey, perp, c.curve)
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
    } else {
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`
    }

    segments.push({ key: `${c.from}->${c.to}`, d, fromY: a.cy, toY: b.cy })
  }

  return segments
}
