'use client'

import { useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useViewportSize } from '@/hooks/useViewportSize'
import { CLOSING_INDEX, INTRO_INDEX, PANEL_COUNT, closingPanel, introPanel, panels } from './data'
import { panelCenterY, wordOpacityAt, type StripView } from './model/reveal'
import { useWordBoxes } from './useWordBoxes'
import { BackgroundLayer } from './layers/BackgroundLayer'
import { ConnectorLayer } from './layers/ConnectorLayer'
import { FRAME_INNER_WIDTH, FrameLayer } from './layers/FrameLayer'
import { TitlePanel } from './layers/TitlePanel'
import { WordsLayer } from './layers/WordsLayer'

/**
 * A tall outer section, a pinned viewport, and a strip of panels translating
 * up through it. Every layer positions itself from `view` alone.
 */

// At 1 the strip tracks the scrollbar 1:1 and a panel is gone in a screenful.
// Above that it holds the screen longer while looking identical, since the
// strip still travels the same distance — only the scroll spent on it grows.
const SCROLL_PER_PANEL = 1.5
const SECTION_VH = (1 + (PANEL_COUNT - 1) * SCROLL_PER_PANEL) * 100

export function AnimatedRoadmap() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const { width, height: viewportH } = useViewportSize(stickyRef)
  const progress = useScrollProgress(sectionRef, viewportH)
  const { registerWord, wordBoxes } = useWordBoxes(stripRef, { width, height: viewportH })

  const translateY = progress * (PANEL_COUNT - 1) * viewportH
  const view: StripView = { viewportH, centerY: translateY + viewportH / 2 }

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ height: `${SECTION_VH}vh` }}>
      <div
        ref={stickyRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: viewportH ? `${viewportH}px` : '100dvh' }}
      >
        {viewportH > 0 && (
          <div
            ref={stripRef}
            className="absolute left-0 top-0 w-full will-change-transform"
            style={{
              height: PANEL_COUNT * viewportH,
              transform: `translate3d(0, ${-translateY}px, 0)`,
            }}
          >
            <BackgroundLayer view={view} />

            <FrameLayer
              panelHeight={`${viewportH}px`}
              opacityOf={(index) => wordOpacityAt(panelCenterY(index, viewportH), view)}
            />

            <TitlePanel
              index={INTRO_INDEX}
              headline={introPanel.headline}
              view={view}
              variant="intro"
              maxWidth={FRAME_INNER_WIDTH}
            />

            {/* Under the words, so a word always sits on top of a grazing line. */}
            <ConnectorLayer wordBoxes={wordBoxes} view={view} />
            <WordsLayer view={view} registerWord={registerWord} />

            {panels.map((panel, i) =>
              panel.headline ? (
                <TitlePanel
                  key={`statement-${panel.id}`}
                  index={i + 1}
                  headline={panel.headline}
                  view={view}
                  variant="statement"
                />
              ) : null,
            )}

            <TitlePanel
              index={CLOSING_INDEX}
              headline={closingPanel.headline}
              view={view}
              variant="statement"
            />
          </div>
        )}
      </div>
    </section>
  )
}
