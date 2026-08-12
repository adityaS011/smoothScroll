import { memo } from 'react'
import Image from 'next/image'
import { CLOSING_INDEX, closingPanel, panels } from '../data'
import { clampSigned, panelCenterY, type StripView } from '../model/reveal'
import { StripPanel } from './StripPanel'

const PARALLAX_DRIFT = 0.12
const PANEL_ZOOM = 0.04
export const DEFAULT_FOCAL = 'center 30%'

// Props never change, so React skips the strip's heaviest subtrees each frame.
export const PanelImage = memo(function PanelImage({
  src,
  focal = DEFAULT_FOCAL,
  priority = false,
}: {
  src: string
  focal?: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="100vw"
      priority={priority}
      style={{ objectFit: 'cover', objectPosition: focal }}
    />
  )
})

/**
 * One panel's image, drifting inside its clipped slot so it travels slower
 * than the words. The drift lives inside the panel rather than on it: the
 * frame overhangs by PARALLAX_DRIFT each side, so the image can lag while the
 * slot stays panel-sized and no seam opens between panels.
 */
function ParallaxPanel({
  index,
  src,
  focal,
  view,
  priority = false,
  tint = false,
}: {
  index: number
  src: string
  focal?: string
  view: StripView
  priority?: boolean
  tint?: boolean
}) {
  const { viewportH } = view

  // +1 a viewport below the center, 0 centered, -1 above. Clamped so an
  // off-screen image can't drift past the overhang and return uncovered.
  const fromCenter = clampSigned((panelCenterY(index, viewportH) - view.centerY) / viewportH)
  const drift = -fromCenter * PARALLAX_DRIFT * viewportH
  const scale = 1 + PANEL_ZOOM * Math.abs(fromCenter)
  const isMoving = Math.abs(fromCenter) < 1

  return (
    <StripPanel index={index} panelHeight={`${viewportH}px`} className="overflow-hidden">
      <div
        className="absolute left-0 w-full"
        style={{
          top: -PARALLAX_DRIFT * viewportH,
          height: viewportH * (1 + 2 * PARALLAX_DRIFT),
          transform: `translate3d(0, ${drift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
          // Hinting all eight would pin eight full-screen textures in GPU
          // memory — the wrong trade on a phone.
          willChange: isMoving ? 'transform' : undefined,
        }}
      >
        <PanelImage src={src} focal={focal} priority={priority} />
      </div>
      {tint && <div className="absolute inset-0 bg-black/40" />}
    </StripPanel>
  )
}

export function BackgroundLayer({ view }: { view: StripView }) {
  return (
    <>
      <StripPanel index={0} panelHeight={`${view.viewportH}px`} className="bg-white" />

      {panels.map((panel, i) => (
        <ParallaxPanel
          key={panel.id}
          index={i + 1}
          src={panel.image}
          focal={panel.focal}
          view={view}
          priority={i === 0}
        />
      ))}

      <ParallaxPanel
        index={CLOSING_INDEX}
        src={closingPanel.image}
        focal={closingPanel.focal}
        view={view}
        tint
      />
    </>
  )
}
