# CRAVE

Landing/drop page for CRAVE — scarcity-engineered strawberry cheesecake, sold
100 jars a week, first-come-first-served. Brand brief lives with the person
who supplied it; this covers the build itself.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- React Three Fiber / drei / Three.js for the procedural hero jar

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Status

**Page 1 (landing/drop page) — hero section only.** Built so far:

- Nav bar + checkout CTA button (hand-built to brand spec)
- Procedural 3D glass jar (glass body, cheesecake-layer bands, black lid with
  knockout logo), rotation tied to scroll position
- Live inventory ticker — currently backed by a stub in
  `src/components/InventoryTicker.tsx` (`fetchAvailableJars`); swap that
  function for a real `fetch`/websocket call to the inventory backend when it
  exists. The component's polling/rendering logic doesn't need to change.

**Not built yet** (see the brief): anti-overselling backend (atomic
reservation + release logic), Paystack checkout integration (stub behind a
feature flag once wired up), routing/additional pages, footer, multi-flavor
data model groundwork.

## Brand rules enforced in code

- Pure black (`--color-ink`) / white (`--color-paper`) only for UI chrome
- Gold (`--color-scarce`, `#C9A227`) reserved for scarcity/urgency signals
  only — the inventory ticker's live dot always, and the ticker/CTA flip
  fully gold when stock is low or sold out. Never used decoratively.
- Flat colors, zero border-radius, no shadows/gradients (`src/index.css`)
- Mobile-first Tailwind breakpoints throughout
