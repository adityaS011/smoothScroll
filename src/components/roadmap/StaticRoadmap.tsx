'use client'

import { useRef } from 'react'
import { useViewportSize } from '@/hooks/useViewportSize'
import { CLOSING_INDEX, INTRO_INDEX, PANEL_COUNT, closingPanel, introPanel, panels } from './data'
import { useWordBoxes } from './useWordBoxes'
import { ConnectorLayer } from './layers/ConnectorLayer'
import { FRAME_INNER_WIDTH, FrameLayer } from './layers/FrameLayer'
import { PanelImage } from './layers/BackgroundLayer'
import { PanelWords } from './layers/PanelWords'
import { HEADLINE_BOX, Headline } from './layers/TitlePanel'
import { StripPanel } from './layers/StripPanel'

/**
 * The same panels, words and lines with nothing moving — for
 * `prefers-reduced-motion`, and for anyone whose JavaScript never arrives.
 * The reveal is an enhancement on a section that already reads.
 */

// An equal share of the section each, so overlays position in percentages.
const SLOT_HEIGHT = `${100 / PANEL_COUNT}%`

const fullyVisible = () => 1

function StaticBackground({ src, focal, tint }: { src?: string; focal?: string; tint?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden bg-white" style={{ height: '100dvh' }}>
      {src && <PanelImage src={src} focal={focal} />}
      {tint && <div className="absolute inset-0 bg-black/40" />}
    </div>
  )
}

export function StaticRoadmap() {
  const sectionRef = useRef<HTMLElement>(null)
  const size = useViewportSize(sectionRef)
  const { registerWord, wordBoxes } = useWordBoxes(sectionRef, size)

  return (
    <section ref={sectionRef} className="relative bg-black">
      {/* Backgrounds sit in normal flow — they give the section its height. */}
      <StaticBackground />
      {panels.map((panel) => (
        <StaticBackground key={panel.id} src={panel.image} focal={panel.focal} />
      ))}
      <StaticBackground src={closingPanel.image} focal={closingPanel.focal} tint />

      {/* Then the moving version's layer order: lines over images, words over lines. */}
      <div className="absolute inset-0">
        <FrameLayer panelHeight={SLOT_HEIGHT} />
      </div>

      <ConnectorLayer wordBoxes={wordBoxes} />

      <div className="absolute inset-0">
        <StripPanel index={INTRO_INDEX} panelHeight={SLOT_HEIGHT} className={HEADLINE_BOX}>
          <Headline variant="intro" maxWidth={FRAME_INNER_WIDTH}>
            {introPanel.headline}
          </Headline>
        </StripPanel>

        {panels.map((panel, i) => (
          <StripPanel
            key={panel.id}
            index={i + 1}
            panelHeight={SLOT_HEIGHT}
            className={panel.headline ? HEADLINE_BOX : ''}
          >
            {panel.headline ? (
              <Headline variant="statement">{panel.headline}</Headline>
            ) : (
              <PanelWords panel={panel} register={registerWord} opacityOf={fullyVisible} />
            )}
          </StripPanel>
        ))}

        <StripPanel index={CLOSING_INDEX} panelHeight={SLOT_HEIGHT} className={HEADLINE_BOX}>
          <Headline variant="statement">{closingPanel.headline}</Headline>
        </StripPanel>
      </div>
    </section>
  )
}
