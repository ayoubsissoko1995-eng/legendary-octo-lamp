import { useEffect, useRef, useState } from 'react'

export function HeroJar({ getProgress = () => 0 }: { getProgress?: () => number }) {
  const [flashKey, setFlashKey] = useState(0)
  const triggerFlash = () => setFlashKey((k) => k + 1)

  const wrapRef = useRef<HTMLDivElement>(null)

  // Portal zoom: scale/lift the video toward the camera as the hero scrolls
  // past. Driven by a rAF loop in Hero.tsx via getProgress(), applied here
  // as a direct style mutation (no React state) to stay smooth on mobile.
  useVideoScrollZoom(wrapRef, getProgress)

  return (
    <div
      className="relative h-full w-full"
      onPointerEnter={triggerFlash}
      onPointerDown={triggerFlash}
    >
      <div ref={wrapRef} className="flex h-full w-full items-start justify-center">
        <video
          className="h-auto w-full max-w-xl object-cover sm:max-w-2xl"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/crave-jar-poster.jpg"
        >
          <source src="/video/crave-jar.webm" type="video/webm" />
          <source src="/video/crave-jar.mp4" type="video/mp4" />
        </video>
      </div>
      {flashKey > 0 && (
        <div key={flashKey} aria-hidden="true" className="jar-flash pointer-events-none absolute inset-0" />
      )}
    </div>
  )
}

function useVideoScrollZoom(ref: React.RefObject<HTMLDivElement | null>, getProgress: () => number) {
  useEffect(() => {
    let frame = 0

    const tick = () => {
      const el = ref.current
      if (el) {
        const progress = getProgress()
        const scale = 1 + progress * 1.6
        el.style.transform = `scale(${scale})`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ref, getProgress])
}
