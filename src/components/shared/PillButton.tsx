import type { ReactNode } from 'react'

type PillButtonProps = {
  children: ReactNode
  variant?: 'solid' | 'outline'
  as?: 'button' | 'a'
  href?: string
  className?: string
}

const VARIANTS = {
  solid: 'bg-blue-600 text-white hover:bg-blue-500',
  outline: 'bg-white/10 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/20',
}

export function PillButton({
  children,
  variant = 'solid',
  as = 'button',
  href,
  className = '',
}: PillButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors ${VARIANTS[variant]} ${className}`

  if (as === 'a') {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return <button className={classes}>{children}</button>
}
