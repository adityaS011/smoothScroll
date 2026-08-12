import type { CSSProperties } from 'react'
import { INTRO_INDEX, introPanel, panels } from '../data'
import { StripPanel } from './StripPanel'

// Sized off the smaller viewport dimension, so it never overflows a phone.
const CIRCLE = 'min(88vw, 90dvh)'

/** Text sized to sit inside the circle rather than run past its edges. */
export const FRAME_INNER_WIDTH = 'min(52vw, 54dvh)'

const RAIL_X = '4.5%'
const RAIL_Y = '7%'
const RAIL_STOPS_SHORT_BY = 10

export type FrameTone = 'dark' | 'light'

const TONE: Record<FrameTone, string> = {
  dark: 'text-neutral-900/30',
  light: 'text-white/30',
}

function Crosshair({ style }: { style: CSSProperties }) {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" className="absolute" style={style}>
      <path d="M4.5 0v9M0 4.5h9" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function Rail({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="absolute"
      style={{
        ...(side === 'left' ? { left: RAIL_X } : { right: RAIL_X }),
        top: RAIL_Y,
        bottom: RAIL_Y,
        width: 1,
      }}
    >
      <div
        className="absolute left-0 w-px bg-current"
        style={{ top: RAIL_STOPS_SHORT_BY, bottom: RAIL_STOPS_SHORT_BY }}
      />
      <Crosshair style={{ left: '50%', top: 0, transform: 'translate(-50%, -50%)' }} />
      <Crosshair style={{ left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' }} />
    </div>
  )
}

/**
 * A circle around the subject, a hairline rail down each side, and a
 * crosshair at every rail end. One `text-*` class inks all three, since the
 * border, rails and strokes all read `currentColor`.
 */
export function PanelFrame({ tone }: { tone: FrameTone }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${TONE[tone]}`} aria-hidden="true">
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-current"
        style={{ width: CIRCLE, aspectRatio: '1', transform: 'translate(-50%, -50%)' }}
      />
      <Rail side="left" />
      <Rail side="right" />
    </div>
  )
}

export function FrameLayer({
  panelHeight,
  opacityOf = () => 1,
}: {
  panelHeight: string
  opacityOf?: (index: number) => number
}) {
  return (
    <>
      {introPanel.frame && (
        <StripPanel
          index={INTRO_INDEX}
          panelHeight={panelHeight}
          style={{ opacity: opacityOf(INTRO_INDEX) }}
        >
          <PanelFrame tone="dark" />
        </StripPanel>
      )}

      {panels.map((panel, i) =>
        panel.frame ? (
          <StripPanel
            key={panel.id}
            index={i + 1}
            panelHeight={panelHeight}
            style={{ opacity: opacityOf(i + 1) }}
          >
            <PanelFrame tone="light" />
          </StripPanel>
        ) : null,
      )}
    </>
  )
}
