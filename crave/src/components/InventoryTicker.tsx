import { useEffect, useState } from 'react'

const TOTAL_JARS = 100
const LOW_STOCK_THRESHOLD = 15

// Stubbed poll — replace the resolved value with a real fetch('/api/inventory')
// call or websocket subscription once the backend exists. Keep the same
// return shape so callers never need to change.
async function fetchAvailableJars(): Promise<number> {
  return 84
}

export function InventoryTicker() {
  const [available, setAvailable] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      const count = await fetchAvailableJars()
      if (!cancelled) setAvailable(count)
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const soldOut = available === 0
  const lowStock = available !== null && available > 0 && available <= LOW_STOCK_THRESHOLD
  const urgent = soldOut || lowStock

  const label =
    available === null
      ? 'CHECKING STOCK…'
      : soldOut
        ? 'SOLD OUT'
        : `${available} / ${TOTAL_JARS} JARS AVAILABLE`

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 border px-4 py-3 text-sm font-bold uppercase tracking-widest ${
        urgent ? 'border-scarce text-scarce' : 'border-ink text-ink'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 bg-scarce ${urgent ? '' : 'animate-pulse'}`}
      />
      [ {label} ]
    </div>
  )
}
