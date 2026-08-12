import type { CSSProperties, ReactNode } from 'react'

/**
 * One panel-sized slot, positioned by index. `panelHeight` is a CSS length so
 * both renderings share it: the strip passes pixels, the motionless page
 * passes each slot's share of the section ("12.5%") and measures nothing.
 */
export function StripPanel({
  index,
  panelHeight,
  className = '',
  style,
  children,
}: {
  index: number
  panelHeight: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div
      className={`absolute left-0 w-full ${className}`}
      style={{ top: `calc(${panelHeight} * ${index})`, height: panelHeight, ...style }}
    >
      {children}
    </div>
  )
}
