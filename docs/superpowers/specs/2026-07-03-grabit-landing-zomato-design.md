# Grabit Landing (Zomato-style) — Design Spec

- **Date:** 2026-07-03
- **Sub-project:** A of 3 (A landing → B Grabit×Omega backend integration → C Omega Android aggregator screen)
- **Repo:** `grabit` (grabitui), Next.js 15.5.15, Tailwind v4, Framer Motion 11
- **Status:** Approved shape, pending spec review

## Goal

Replace the grabit app's bare `/` → `/home` redirect (shipped in PR#10 as a stopgap) with a real marketing landing that:
1. Matches the **overall look of the Zomato reference** the user shared — dark, food-forward, image-first, flat depth, alternating dark/light bands, minimal chrome — using **Grabit-original content** (not a literal clone).
2. Funnels two audiences from one page: consumers → **Browse cafés** (`/home`, browse-first, no login) and café owners → **Partner with us** (`/partner`, the PR#11 onboarding wizard).
3. Reuses the strongest components from the existing `grabitui-landing` repo landing rather than rebuilding from scratch.

## Non-goals

- Not reverting PR#10's dedup work — only the `/` redirect line changes; `/home` remains the app.
- No second Vercel deploy / no separate `grabitui-landing` deployment — landing lives in the grabit app; app already owns the `grabit365.com` apex.
- No new consumer browsing on the landing — `/home` already does that; the landing teases and funnels.
- No fabricated social proof (fake stats, fake testimonials with invented names).
- No literal reproduction of Zomato's copy, imagery, brand marks, or section content.

## Architecture

- `src/app/page.tsx` — remove `redirect('/home')`; render `<LandingClient />`; add marketing `metadata` (title, description, OpenGraph).
- `src/app/LandingClient.tsx` — NEW client component, wraps the page in `.gb-app` (warm-editorial theme, so the visual handoff into `/home` is seamless).
- `src/components/landing/*.tsx` — NEW section components (one file each): `LandingNav`, `Hero`, `TrustBand`, `HowItWorks`, `WhyGrabit`, `ProductPreview`, `PartnerPitch`, `FinalCTA`, `LandingFooter`.
- `src/components/ui/container-scroll-animation.tsx` — PORTED from `grabitui-landing` (deleted from app in PR#10) for the product preview, with the 3D tilt flattened toward Zomato's flat aesthetic.
- `src/middleware.ts` — no change; `/` is already public (only `checkout|order` per-slug and marketplace `orders|profile` are gated).

## Component reuse matrix

| Existing (grabitui-landing) | Action | Why |
|---|---|---|
| Hero (Framer entrance, mobile full-bleed + desktop split) | **Reuse** structure + entrance animation; retheme to warm-editorial with a darker food-forward treatment | Strong, already Grabit-voiced ("Order ahead. Skip the queue.") |
| FEATURES bento (20-min advance / Pay online / WhatsApp updates) | **Reuse** content; restyle from 3-equal-cards into a Zomato-style tile cluster | Grabit-true feature copy already written |
| STEPS dark section (2-col zigzag + image grid) | **Reuse** | Already a Zomato-style dark band |
| ContainerScroll phone mockup (real `/home` menu preview) | **Reuse**, flatten the tilt | Maps to Zomato's app-showcase; shows the real product |
| CafeCircularGallery (OGL 3D) | **Drop** | Heavy, ornate (off Zomato-flat); browsing is redundant with `/home` |
| TestimonialsSection | **Drop** | No real reviews yet; fabricated names/quotes are dishonest |
| ReadyToJoinRitual (GSAP finale) | **Drop** → replace with `PartnerPitch` + `FinalCTA` | Heavy; the partner band is the higher-value use of that slot |

`gsap` and `ogl` deps become unused after this; removal is optional cleanup, out of scope here. No new deps (`framer-motion` already present).

## Page sections (top → bottom)

Zomato's alternating dark/light band rhythm, Grabit-original content. "Light" bands use `.gb-app` cream (`--gb-surface`); "dark" bands use the cocoa `--gb-hero` gradient. Accent = terracotta (`--gb-primary`). Headlines Newsreader (`gb-serif`), body Hanken.

1. **LandingNav** (frosted, light) — logo left; center links *How it works*, *For cafés*; right primary **Browse cafés** (→`/home`) + quiet **Partner with us** (→`/partner`). Replaces the current "Login" primary CTA. Minimal chrome.
2. **Hero** (dark) — full-bleed café/food photo + dark gradient, white Newsreader headline "Order ahead. Skip the queue.", subcopy, primary **Browse cafés** + secondary **Partner with us**, a "Now in Delhi" location tag. Reuse the existing Framer entrance (stagger + spring).
3. **TrustBand** (light) — honest, no fabricated numbers: three qualitative pillars (Skip the wait · Pay online · WhatsApp updates). If a real live-café count is available from data at build time, show it; otherwise stay qualitative.
4. **HowItWorks** (dark, 2-col zigzag) — Select your craft → Customize & pay → Grab & go (reuse existing STEPS copy + image grid).
5. **WhyGrabit** (light, tile cluster) — 20-min advance order · Pay online · WhatsApp updates (reuse FEATURES content; varied tile sizes, not 3 equal columns).
6. **ProductPreview** (light) — flattened ContainerScroll phone mockup of the real `/home` menu → cart → pickup-time flow.
7. **PartnerPitch** (dark band — the repurposed "GOLD" slot) — "Run a café? Own your orders." Grabit-original benefits (orders land on your own Omega POS; keep your margin vs commission-heavy aggregators; one tablet at the counter). CTA **Partner with us** → `/partner`. This is the café-acquisition funnel.
8. **FinalCTA** (light) — "Start ordering" → `/home` and "Partner with us" → `/partner`.
9. **LandingFooter** — Grabit footer: Privacy (`/privacy`), Terms (`/terms`) — pages already exist — plus Partner and Contact. Real socials only, or omit.

## Design principles carried from the Zomato reference

- **Flat depth** — photography and tonal layering carry the design; only small card shadows, no heavy elevation stacks, no neon glows.
- **Image-first, minimal chrome** — generous vertical spacing around hero and CTAs; content breathes.
- **Radius by role** — buttons small radius, cards larger radius, chips full-pill (matches existing `--gb-r-card` = 22px for cards).
- **Restrained motion** — Framer entrance + scroll reveals + tile hover only. No GSAP cinematic sequences.

## Content honesty rules

- No fabricated metrics (no "N cities / N orders" unless real).
- No testimonials with invented people.
- "Coming soon in Delhi" café strip stays explicitly labeled as aspirational.
- Imagery: existing Unsplash CDN URLs are acceptable for build/preview; flag to swap for owned/licensed café photography before production.

## Success criteria (verifiable)

1. Visiting `/` renders the landing (no redirect); `tsc --noEmit` clean; dev server compiles `/` with no console/server errors.
2. "Browse cafés" navigates to `/home`; "Partner with us" navigates to `/partner`.
3. `/` is reachable without any auth cookie (guest).
4. `.gb-app` theme active on the landing (warm-editorial), visually continuous with `/home`.
5. No `gsap`/`ogl` imports remain in the landing render path; `CafeCircularGallery`, `TestimonialsSection`, `ReadyToJoinRitual` not mounted.
6. Mobile (375px) and desktop (≥1280px) both render without horizontal scroll.

## Follow-ups (out of scope)

- Swap Unsplash → owned café imagery before prod.
- Optional: remove now-unused `gsap`/`ogl` deps.
- OG image asset for the marketing metadata.

## Repo note

Root `docs/` (where all prior grabit specs live) is not git-tracked; the code changes commit in the `grabit` repo on a feature branch. This spec is stored with its siblings for continuity.
