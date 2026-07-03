# Grabit Landing (Zomato-style) — Cross-Device Handoff

**Branch:** `feat/grabit-landing-zomato` (off `origin/master` @ `f93af07`)
**As of:** 2026-07-03, pushed as a WIP checkpoint so work can resume on another device.

This is sub-project **A** of a 3-part effort (A landing → B Grabit×Omega backend integration → C Omega Android aggregator screen). Only A is in flight.

## What this is
Replaces the grabit app's old `/` marketing splash with a Zomato-style (structure/aesthetic only, original Grabit content) food-forward landing that funnels: **Browse cafés → `/home`** (browse-first, no login) and **Partner with us → `/partner`** (PR#11 onboarding). Warm-editorial `.gb-app` theme with cocoa dark bands.

- **Spec:** `docs/superpowers/specs/2026-07-03-grabit-landing-zomato-design.md`
- **Plan (8 tasks, full code):** `docs/superpowers/plans/2026-07-03-grabit-landing-zomato.md`

## Progress (commits on this branch, all signed, gradient365)
- Task 1 ✅ `9fa7187` — shell at `/` (replaces old splash), `.gb-app` wrapper, `--gb-r-card` token, marketing metadata. Reviewed clean, live-verified.
- Task 2 ✅ `c3ab61d` — LandingNav (browse-first + partner CTAs, desktop center links). Reviewed clean, links live-verified.
- Task 3 ✅ `c2e529c` + fix `2aa9e08` — Hero (dark food-forward). Reviewer caught a stale `100dvh` on `<main>` fighting Hero's `92dvh`; fixed (gap=0 verified).
- Task 4 ✅ `a336f9a` — TrustBand + HowItWorks (dark band, `id="how-it-works"` resolves the nav anchor). Reviewed clean.
- Task 5 ✅ `9d7e207` — WhyGrabit tile cluster (lead tile spans wide ≥820px). Reviewed clean.
- Task 6 ✅ `ae76056` — ProductPreview (flat phone mockup). Committed + tsc clean; **task review still pending** at time of this checkpoint.

## Remaining
- **Task 7** (base `ae76056`): PartnerPitch (dark band) + FinalCTA + LandingFooter. Full code in the plan.
- **Task 8**: full-page verification pass + open PR to `master`.

## How to resume on another device
1. Clone/pull `feat/grabit-landing-zomato`. `pnpm i` (or the repo's installer) in `grabit/`.
2. The SDD progress ledger + per-task briefs/reports under `.superpowers/sdd/` are **git-ignored — local-only**, so they will NOT be present. Regenerate a task brief from the committed plan with the superpowers skill script:
   `bash <superpowers>/skills/subagent-driven-development/scripts/task-brief docs/superpowers/plans/2026-07-03-grabit-landing-zomato.md 7`
3. Continue via `superpowers:subagent-driven-development` (fresh implementer per task → review-package → task reviewer → live check → commit).

## Gotchas (verified this session)
- **Typecheck:** `./node_modules/.bin/tsc --noEmit` from `grabit/`. NEVER `npx tsc` (repo ships a prank tsc that fakes "clean").
- **Preview:** managed `grabit` config (`npx next dev --port 3004`, cwd `grabit`). `preview_screenshot` TIMES OUT here — verify via `preview_eval` DOM/computed-style reads.
- **Push identity:** `gh auth switch --user gradient365` before push/PR (sahilKumar1122 has no access to the private KineticTechno repo), switch back after. Commits are signed (`commit.gpgsign=true`), no `Co-Authored-By`, no em dashes.
- **Base-branch reality:** branched off `master`, which still has the OLD splash + orphan components (`CafeCircularGallery`/`ReadyToJoinRitual`/`container-scroll-animation`/`testimonials-columns`). They are left as dead files on purpose — PR#10 deletes them; deleting here would conflict.
- **`/partner` 404s** until PR#11 merges (the landing links to it; destination arrives with #11).
- Overlaps open **PR#10** on `page.tsx` + `globals.css` — if #10 merges first, rebase and re-verify.

## Minor findings logged (for the final whole-branch review, not yet fixed)
- `Hero.tsx`: redundant `className="object-cover"` alongside inline `objectFit:cover` (from the plan snippet).
- `WhyGrabit.tsx`: dead `gridColumn: 'span 1'` on the lead tile below 820px (no-op, from the plan snippet).
