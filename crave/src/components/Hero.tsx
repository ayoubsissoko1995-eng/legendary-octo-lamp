import { lazy, Suspense, useEffect, useRef } from 'react'
import { CtaButton } from './CtaButton'
import { InventoryTicker } from './InventoryTicker'

// Three.js is the bulk of the JS payload — split it into its own chunk so it
// loads after first paint instead of delaying it (mobile drop traffic).
const HeroJar = lazy(() =>
  import('./HeroJar').then((mod) => ({ default: mod.HeroJar })),
)

export function Hero() {
  const outerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  // Portal-zoom scroll effect: the jar grows toward the camera as the hero
  // scrolls past, like flying through it. Tracked via a plain ref + rAF loop
  // (not React state) so it doesn't re-render on every scroll tick, and read
  // directly by HeroJar's useFrame loop each frame.
  useEffect(() => {
    let frame = 0

    const update = () => {
      const section = outerRef.current
      if (section) {
        const rect = section.getBoundingClientRect()
        const scrollRange = Math.max(rect.height - window.innerHeight, 1)
        const progress = Math.min(1, Math.max(0, -rect.top / scrollRange))
        progressRef.current = progress

        if (contentRef.current) {
          contentRef.current.style.opacity = String(1 - progress)
          contentRef.current.style.transform = `scale(${1 - progress * 0.15}) translateY(${progress * -24}px)`
        }
        if (glowRef.current) {
          glowRef.current.style.opacity = String(progress * 0.85)
        }
      }
      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section id="drop" ref={outerRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-16">
        {/* Ticker gets real, dedicated space up top — not floating over the video */}
        <div className="relative z-10 flex justify-center border-b border-ink bg-paper px-4 py-3">
          <InventoryTicker />
        </div>

        <div className="relative flex flex-1 flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={null}>
              <HeroJar getProgress={() => progressRef.current} />
            </Suspense>
          </div>

          {/* Portal glow — intensifies as the jar zooms in, selling the "flying through" transition */}
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] opacity-0"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)',
            }}
          />

          <div
            ref={contentRef}
            className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 text-center sm:pb-24"
          >
            <div className="flex flex-col items-center gap-4 bg-paper/90 px-6 py-6 backdrop-blur-sm sm:px-10 sm:py-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink sm:text-sm">
                Strawberry Cheesecake &middot; R150
              </p>
              <h1 className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                Scarce. Craved. Gone.
              </h1>
              <p className="max-w-md text-sm text-ink sm:text-base">
                100 jars. Every week. First come, first served — no waitlist, no
                gatekeeping. When they&apos;re gone, they&apos;re gone.
              </p>

              <CtaButton>Grab Now — R150</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
