'use client'

import { useState } from 'react'
import { PillButton } from '@/components/shared/PillButton'

const NAV_LINKS = [
  { label: 'Ring AIR' },
  { label: 'Ring PRO' },
  { label: 'Blood Vision' },
  { label: 'Performance Lab', badge: 'NEW' },
  { label: 'Home Health' },
  { label: 'M1 CGM' },
  { label: 'Ovulation Tracking' },
  { label: 'UltrahumanX' },
  { label: 'Shop' },
]

function Logo() {
  return (
    <a
      href="#"
      className="flex shrink-0 items-center gap-2 text-white"
      aria-label="Ultrahuman home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-white/50">
        <span className="h-3 w-3 rounded-full bg-white" />
      </span>
      <span className="text-sm font-semibold tracking-widest uppercase">Ultrahuman</span>
    </a>
  )
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13 5.4 5M7 13l-2 4h12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  )
}

function NavLinkItem({ label, badge }: { label: string; badge?: string }) {
  return (
    <a
      href="#"
      className="flex items-center gap-1.5 whitespace-nowrap text-white/85 hover:text-white"
    >
      {label}
      {badge && (
        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
          {badge}
        </span>
      )}
    </a>
  )
}

export function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Logo />

        {/* Nine links plus a logo and a CTA only just fit at xl; the wider gap
            waits until there is room for it. */}
        <div className="hidden items-center gap-4 text-sm xl:flex 2xl:gap-5">
          {NAV_LINKS.map((link) => (
            <NavLinkItem key={link.label} {...link} />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3 text-white">
          <button aria-label="Cart" className="hover:text-white/70">
            <CartIcon />
          </button>
          <div className="hidden sm:block">
            <PillButton>EXPLORE PLANS</PillButton>
          </div>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="xl:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-base">
            {NAV_LINKS.map((link) => (
              <NavLinkItem key={link.label} {...link} />
            ))}
            <div className="pt-2 sm:hidden">
              <PillButton className="w-full">EXPLORE PLANS</PillButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
