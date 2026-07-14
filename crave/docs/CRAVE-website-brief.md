# CRAVE — Website Build Brief for Claude Code

## What this is
CRAVE is a scarcity-engineered luxury dessert brand (Cape Town, South Africa) sold like a
streetwear drop, not a bakery. This document is the full context for building the website.
Read this in full before writing any code.

---

## Brand identity (LOCKED — do not deviate)
- Name: **CRAVE**
- Logo files included in this package: `crave-logo-master.svg` (editable vector),
  `crave-logo-print.pdf`, `crave-logo-4000px.png`. Use the SVG for the website.
- Wordmark: bold, rounded, playful-but-confident typeface, white, knocked out of a solid
  black box with rounded corners. Signature detail: a curling swirl "tail" flowing from the V.
- Subtext / tagline used across the site: **"SCARCE. CRAVED. GONE."**
- Secondary tagline (footer, back panel, bio): **"LIMITED BY DESIGN"**
- Color system: **pure black and white only** for everyday UI. Gold (#-choose a rich gold,
  e.g. #C9A227) is reserved EXCLUSIVELY for scarcity/urgency signals — countdown timers,
  low-stock warnings, "SOLD OUT" stamps. Never use gold decoratively.
- Tone: confident, minimal, high-fashion streetwear (think Trapstar / Off-White energy).
  Not cute, not "neighborhood bakery." No stock photography clichés.

## Business model (affects UX/copy, not just design)
- Product: strawberry cheesecake in a glass jar, R150 each.
- Strict weekly cap: **100 jars/week**, sold first-come-first-served. No waitlist, no gated
  access — the brand is explicitly NOT exclusive on access, only on supply. Anyone can try
  to buy; the site just runs out.
- Delivery: Friday and Saturday, customer picks a slot OR a collection point (final delivery
  mechanism — pickup point vs. subcontracted courier — still being decided; build the
  checkout flow so a "fulfillment method" selector is easy to add/adjust later).
- Future flavors (NOT in v1 scope — do not build multi-flavor UI yet): a second, pricier
  flavor will launch in a few months on limited specific days. Keep the product data model
  flexible enough to add a flavor later without a rebuild, but ship v1 with ONE product only.
- The annual "10x Drop" mega-event and "Golden Lid" competition mechanic are explicitly
  OUT OF SCOPE for this build — deferred until the base weekly model proves out over 24
  consecutive weeks. Do not build any of that infrastructure now.

## Payments — IMPORTANT CONSTRAINT
- Paystack is the chosen payment rail (no monthly fee, webhook support for inventory-lock
  logic).
- Paystack activation requires a registered South African business, which does NOT exist
  yet (founder is currently abroad; company registration happens later).
- **Build the full checkout flow and payment integration point now, but stub/mock the
  actual Paystack API calls behind an environment variable or feature flag.** The real keys
  get dropped in later — the code should be ready to go live the moment they exist, with
  no architecture changes needed.

---

## Page 1: The landing / drop page

### 3D Hero Jar
- An idealized (not photo-real) 3D glass jar, built as a lightweight procedural model —
  primitives and basic materials, NOT a heavy imported/scanned mesh. This matters: the
  audience is rushing to buy on mobile during a narrow drop window, so load time is a
  conversion factor, not a nice-to-have.
- Structure: glass cylinder body, a few horizontal bands of translucent/colored material
  suggesting the cheesecake layers (cream, strawberry, biscuit base — no need for
  photoreal texturing), solid black lid carrying the CRAVE knockout logo.
- Rotation is tied to **scroll position** (map `scrollY` to the jar's Y-rotation), not
  device gyroscope/tilt. Reliable on cheap Android phones under load beats "magical" but
  janky or permission-gated.
- Recommend React Three Fiber (Three.js + React) for this if the rest of the site is React;
  plain Three.js is fine otherwise.

### Live Inventory Ticker
- Displayed right beside the checkout button: `[ 84 / 100 JARS AVAILABLE ]`
- This must reflect a REAL server-held count — poll or subscribe (websocket) to a backend
  value, never fake/hardcode it. It should visibly animate down on each confirmed sale for
  everyone watching, not just the buyer.

### Anti-overselling architecture (critical — this protects the business)
- The frontend must never be trusted as the source of truth for inventory.
- Every "add to cart" / checkout-start request re-checks inventory server-side using an
  ATOMIC operation — e.g. "only increment reserved_count if reserved_count < 100" as one
  indivisible database transaction. This is what prevents two people at jar #100 from both
  succeeding during a traffic spike.
- A reservation holds a jar for a short window (5–10 minutes) while the customer pays.
  If payment doesn't complete in time, auto-release the hold back into inventory.
- Only a confirmed Paystack webhook event marks a jar as permanently sold.
- The instant the 100th confirmed sale lands, the checkout button flips to "SOLD OUT" for
  EVERYONE, site-wide — not just removed from a list.

---

## Design system notes for implementation
- Flat colors only. No gradients, no chrome/metallic effects, no drop shadows beyond
  minimal functional ones. Discipline and restraint are the brand's whole aesthetic point.
- Typography: pair the rounded logo wordmark with a clean, confident sans-serif for body
  text (e.g. Inter, Poppins, or similar) — not a second decorative font.
- Mobile-first. Most traffic during a drop will be phones.

---

## Assets included in this package
- `crave-logo-master.svg` — primary lockup, editable vector
- `crave-logo-print.pdf` — vector PDF (also fine for high-res web use)
- `crave-logo-4000px.png` — transparent PNG raster fallback

## What NOT to build yet
- No multi-flavor selector
- No Golden Lid / 10x Drop / treasure-hunt mechanics
- No live Paystack transactions (stub only)
- No membership/waitlist/gated-access system of any kind — first-come-first-served only
