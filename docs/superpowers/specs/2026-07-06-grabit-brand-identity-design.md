# Grabit Brand Identity — Design Spec

**Date:** 2026-07-06
**Status:** Approved (direction + palette + typography). Mascot art pending from founder.
**Scope:** Full visual rebrand of Grabit (B2C cafe pre-order, grabit365.com). Name kept; logo, color, and typography replaced. Supersedes the crimson `#b7122a` / Zomato-Dark landing system and the stale CLAUDE.md `#ff6b00` reference.

---

## 1. Positioning & personality

Grabit is a playful, **mascot-led** cafe pre-order brand — "skip the queue" coffee/cafe pickup, India-first, built to become a category giant.

**Strategic bet (from the food-tech brand case study):**
1. Own **one warm color** and defend it — but avoid the crowded orange/red lane (Swiggy `#FC8019`, Zomato `#E23744`, DoorDash `#FF3008`). We go **marigold gold**.
2. Put a **lovable mascot** at the center — the genuine white space (no Indian food giant runs a warm friendly mascot; Deliveroo's Roo is abstract). The mascot carries voice, stickers, notifications, social (the Duolingo "Duo" model).
3. The mark encodes the **promise** (skip-the-queue / speed), not a picture of food (Swiggy pin, DoorDash dash).
4. Keep a **custom-feeling rounded wordmark**; let mascot + voice do the emotional work.

Personality words: playful, warm, cheeky, fast, dependable.

---

## 2. Color

Marigold is the hero — used for fills, CTAs, and the mascot. **Never** for body text (fails contrast on white). Espresso Ink carries all text. Berry is a rare accent for delight / "hot".

| Token | Hex | Role |
|-------|-----|------|
| `--brand-marigold` | `#FFB100` | Primary · CTAs · mascot · fills |
| `--brand-marigold-press` | `#E09A00` | Hover / pressed |
| `--brand-gold-fill` | `#FFE7B0` | Soft fills · highlights |
| `--brand-cream` | `#FFF3DC` | Warm surface |
| `--brand-paper` | `#FFFDF8` | Base background |
| `--brand-ink` | `#241612` | Text · dark surfaces |
| `--brand-ink-soft` | `#4A3B33` | Secondary text |
| `--brand-berry` | `#FF4D6D` | Rare accent · "hot" badges |
| `--brand-line` | `#EDE2CE` | Borders / hairlines |
| `--brand-muted` | `#8A7A6B` | Muted labels |

**Semantic (kept distinct from the marigold brand color):**
`--ok #2F9E6B` · `--warn #C77800` · `--err #E5484D` · `--info #3B82C4`

**Accessibility:** Marigold on Espresso Ink passes for large text/icons. Never set gold text on paper/white. Body text is always Ink or Ink-Soft. Target WCAG AA for text.

---

## 3. Typography

**System 1 — "Bounce"**, all free-commercial and self-hosted (no CDN).

| Role | Face | Foundry | Delivery |
|------|------|---------|----------|
| Display / wordmark (Latin + Devanagari) | **Baloo 2** | Ek Type | `next/font/google`, subsets `['latin','devanagari']`, weights 500/700/800 → `--font-display` |
| UI / body (Latin) | **Satoshi** | Indian Type Foundry (Fontshare) | `next/font/local`, woff2 in `src/fonts/`, weights 500/700/900 → `--font-ui` |
| Hindi body / dense UI | **Mukta** | Ek Type | `next/font/google`, subsets `['latin','devanagari']`, weights 400/500/700 → `--font-deva` |

- **Numerals are load-bearing** (₹ prices, pickup timers, slot counts). Apply `font-variant-numeric: tabular-nums` (Satoshi `tnum`) on all prices/timers/counters.
- **Devanagari plan:** Baloo 2 carries playful Hindi headlines in the same superfamily as Latin (zero seam); Mukta carries Hindi body/dense UI. Wire via `unicode-range` so the browser swaps by script.
- **Type scale (px):** 12 / 14 / 16 / 20 / 24 / 32 / 44 / 64. Body 16, line-height ~1.5. Test the wordmark at the 44px app-icon floor.
- Ship **one variable woff2 per family** where possible; WOFF2 only; `display: swap`; preload from root layout to kill CLS.

---

## 4. Logo & app icon

- Wordmark: lowercase **`grabit`**, "it" set in Marigold, rest in Ink. Baloo 2 800, tight tracking (`-0.04em`).
- App icon: **Beano's head** on a Marigold rounded-square (radius ~24% of size), or the bean glyph at very small sizes.
- Clear space: one bean-height on all sides. Min wordmark width 84px.
- Variants: primary (on paper), reverse (on ink), mono (on marigold).

---

## 5. Mascot — "Beano"

A coffee **bean** character: vertical ellipse (~0.8:1), S-curve center crease, marigold body, ink features. The bean = coffee; the running pose = speed = the promise.

**Pose set → product moment:**
- Running — hero, loaders
- Waving — empty states
- Holding cup — order ready
- Sleeping — no orders yet
- Peeking — tooltips / nudges

**Handoff note:** The founder is designing the final polished mascot illustration. The SVG concepts in the brand-system Artifact are construction references only. Final art (and any additional poses) will be supplied and dropped into an `<GrabitMascot pose="…" />` component. Keep marigold body + ink features + upright orientation as the construction rules.

---

## 6. Components (brand-level rules)

- **Buttons:** primary = Marigold bg + Ink text, pill radius 999, press → `#E09A00`. Secondary = Ink outline. Tertiary = Ink solid + cream text.
- **Cards:** paper bg, radius 16–20, warm soft shadow (`0 8px 24px -18px #24161240`), `--brand-line` border.
- **Order status pills** (map to the pickup flow, semantic-tinted, distinct from brand gold):
  Pending `#FFE7B0/#8A5A00` · Confirmed `#D7ECFB/#215C88` · Prepping `#FFF3DC/#C77800` · Ready `#D8F1E4/#1E7A50` · Done `#EDE2CE/#4A3B33`.
- **Menu row:** thumbnail (gold-fill tile), Baloo 2 name, Satoshi desc, tabular price, "Add +" primary button, Berry "HOT" badge when relevant.

---

## 7. Motion & voice

- **Motion:** playful spring `cubic-bezier(.34,1.56,.64,1)`, 180–320ms. Beano bounces on order-placed, runs across loaders; steam rises on "ready". Always respect `prefers-reduced-motion`.
- **Voice:** cheeky, warm, concise; light Hinglish OK. Examples: "Beano's on it! Your cold brew hits the counter at 10:30." / "Queue? Never met her." / "Your coffee, jumping the queue."

---

## 8. Guardrails

**Do:** marigold for fills/CTAs/Beano; all text in Ink/Ink-Soft; keep Beano upright with room to breathe; reserve Berry for one accent per screen; tabular numerals on all prices/timers.
**Don't:** gold text on white; recolor/squish Beano or add features; mix in the old crimson/peach; more than one accent pop per view; a display face (Baloo) for body text.

---

## 9. Rollout approach

Goal: uniform brand on **every** screen (customer + staff).

1. **Fonts:** wire Baloo 2 / Satoshi / Mukta in `src/app/layout.tsx` via `next/font` → CSS variables `--font-display`, `--font-ui`, `--font-deva`. Remove Outfit / Newsreader / Hanken.
2. **Tokens:** replace the crimson/Zomato-Dark values in `src/app/globals.css` (the `--gb-*` set) with the Marigold palette above; keep token *names* stable so components inherit automatically.
3. **Type utilities:** map `.gb-serif` / display usages to `--font-display`; body to `--font-ui`; add a Devanagari class/`unicode-range` for `--font-deva`.
4. **Screen sweep (one at a time, verify each):** landing (`/`) → customer flow (`/[slug]`, menu, cart, checkout, order, order status) → staff (`/[slug]/manage/*`) → shared components (`components/gb/*`, `components/landing/*`).
5. **Mascot:** integrate founder's final art via a `GrabitMascot` component; use placeholder concept until delivered.
6. **Cleanup:** delete the throwaway `/brand-type` specimen route before prod.
7. **Verify:** WCAG AA contrast pass; tabular numerals on prices/timers; Hindi renders on-brand; no leftover crimson/peach.

**Reference assets:** brand pitch + brand-system boards (claude.ai Artifacts); live type specimen at `/brand-type` (branch `feat/grabit-rebrand`).
