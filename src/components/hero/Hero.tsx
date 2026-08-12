import Image from 'next/image'
import { PillButton } from '@/components/shared/PillButton'
import { AnnouncementBar } from './AnnouncementBar'
import { NavBar } from './NavBar'
import { TelemetryPill } from './TelemetryPill'
import { BookATourPill } from './BookATourPill'

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="relative flex h-dvh w-full flex-col overflow-hidden">
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/30 to-black/80" />

      <header className="relative z-10">
        <AnnouncementBar />
        <NavBar />
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-hero leading-[0.9] font-extrabold tracking-tight text-white italic">
          PERFORMANCE LAB
        </h1>
        <p className="text-subhead mt-4 max-w-xl font-light text-white/80">
          Experience the Future Of Human Performance
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PillButton>EXPLORE PLANS</PillButton>
          <PillButton variant="outline">
            <PlayIcon />
            PLAY VIDEO
          </PillButton>
        </div>
      </div>

      {/* Wide: three columns, so the readout centres on the viewport rather
          than on whatever space the pill leaves. Narrow: one column, and the
          two stack instead of squeezing into each other.

          The switch waits for lg because centring needs room for the pill
          column twice over — once for real, once as the balancing spacer.
          Below that the sum overflows and the middle drifts off centre. */}
      <div className="relative z-10 grid gap-3 px-4 pb-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        {/* Balances the Book a Tour column so the middle one is centred. */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* Last on a phone, so the readout still sits at the very bottom. */}
        <div className="order-last justify-self-center lg:order-0">
          <TelemetryPill />
        </div>

        <div className="justify-self-end">
          <BookATourPill />
        </div>
      </div>
    </section>
  )
}
