import { lazy, Suspense } from 'react'
import { CtaButton } from './CtaButton'
import { InventoryTicker } from './InventoryTicker'

// Three.js is the bulk of the JS payload — split it into its own chunk so it
// loads after first paint instead of delaying it (mobile drop traffic).
const HeroJar = lazy(() =>
  import('./HeroJar').then((mod) => ({ default: mod.HeroJar })),
)

export function Hero() {
  return (
    <section
      id="drop"
      className="relative flex min-h-screen flex-col justify-end overflow-hidden pt-16"
    >
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <HeroJar />
        </Suspense>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 pb-16 text-center sm:pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink/70 sm:text-sm">
          Strawberry Cheesecake &middot; R150
        </p>
        <h1 className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
          Scarce. Craved. Gone.
        </h1>
        <p className="max-w-md text-sm text-ink/70 sm:text-base">
          100 jars. Every week. First come, first served — no waitlist, no
          gatekeeping. When they&apos;re gone, they&apos;re gone.
        </p>

        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <CtaButton>Buy Now — R150</CtaButton>
          <InventoryTicker />
        </div>
      </div>
    </section>
  )
}
