# Grabit Landing (Zomato-style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the grabit app's `/` → `/home` redirect with a Zomato-style, food-forward marketing landing that funnels consumers to `/home` (browse-first) and café owners to `/partner`.

**Architecture:** A server `page.tsx` renders a `'use client'` `LandingClient` wrapped in `.gb-app` (warm-editorial theme). `LandingClient` composes nine focused section components under `src/components/landing/`. Sections alternate cream (`--gb-surface`) and cocoa (`--gb-hero`) bands for Zomato's dark/light rhythm. Styling follows the existing gb consumer pattern: inline styles + `--gb-*` CSS vars + Framer Motion (NOT Tailwind color utilities, which map to the crimson staff theme).

**Tech Stack:** Next.js 15.5.15 (App Router), React 19, Framer Motion 11 (already a dep), Material Symbols (loaded app-wide in `layout.tsx`), TypeScript.

## Global Constraints

- Theme: landing renders inside `<div className="gb-app">`; use `--gb-*` vars via inline styles. Never use Tailwind `bg-surface`/`text-on-surface` etc. (those resolve to the crimson `@theme`, not gb).
- Headlines use `className="gb-serif"` (Newsreader); body is default gb sans (Hanken).
- Accent = `var(--gb-primary)` (terracotta). Dark bands = `background: var(--gb-hero)`.
- Do NOT import or mount `gsap`, `ogl`, `CafeCircularGallery`, `TestimonialsSection`, or `ReadyToJoinRitual`.
- No fabricated stats or testimonials; no invented person names. "Coming soon" content stays labeled aspirational.
- No literal Zomato copy/imagery/marks — original Grabit content only.
- CTAs: "Browse cafés" → `/home`; "Partner with us" → `/partner`.
- Icons: reuse `MS` from `@/components/gb/kit` (Material Symbols wrapper).
- Every full-height/hero section uses `min-h-[...dvh]` or explicit min-height, never `h-screen`.
- **Typecheck command:** `cd grabit && ./node_modules/.bin/tsc --noEmit` — NEVER `npx tsc` (repo ships a prank tsc that fakes "clean").
- **Render verification:** managed preview `grabit` config (`npx next dev --port 3004`, cwd `grabit`). Verify via `preview_eval` DOM/computed-style reads. The `preview_screenshot` tool times out in this repo — do not rely on it.
- **Commits:** signed, identity `gradient365` (already set per-repo). No `Co-Authored-By`. No em dashes in commit messages. Branch `feat/grabit-landing-zomato` off `origin/master`.

---

### Task 1: Branch, content module, LandingClient shell, route swap

Produces a working `/` that renders an empty `.gb-app` landing shell (walking skeleton) with no redirect.

**Files:**
- Create: `grabit/src/components/landing/content.ts`
- Replace: `grabit/src/app/LandingClient.tsx` (ALREADY EXISTS on master — the old 675-line crimson marketing splash; fully overwrite it with the new shell)
- Modify: `grabit/src/app/page.tsx` (on master it renders `<LandingClient cafes={cafes}/>` with a server cafe-fetch — replace entirely with the new render + metadata below)
- Modify: `grabit/src/app/globals.css` (add one `--gb-r-card` token to the `.gb-app` block; master lacks it and Tasks 5/7 use it)

**Base reality (verified against origin/master):** the branch is already created off `origin/master`. `/home` and `src/components/gb/kit.tsx` exist (from merged PR#9). `--gb-r-card`, `/partner`, and PR#10's CafeGate/LocationPill do NOT exist on master. The old `LandingClient.tsx` + `CafeCircularGallery`/`ReadyToJoinRitual`/`container-scroll-animation`/`testimonials-columns` are still present; leave the latter four as orphaned dead files (do NOT delete — PR#10 deletes them; deleting here causes a merge conflict). The landing does not import any of them.

**Interfaces:**
- Produces: `content.ts` exports `FEATURES: Feature[]`, `STEPS: Step[]`, `STEP_IMAGES: StepImage[]` consumed by Tasks 5 and 4. `LandingClient` default export (client component, NO props) consumed by `page.tsx`.

- [ ] **Step 1: Branch already created**

The controller already ran `git checkout -b feat/grabit-landing-zomato origin/master`. Confirm with `git -C C:/Users/sahil.kumar/kinetictech-repos/grabit branch --show-current` → `feat/grabit-landing-zomato`. Do not create it again.

- [ ] **Step 2: Write `content.ts`**

```typescript
// grabit/src/components/landing/content.ts
// Landing copy — Grabit-original. Shared by section components (DRY).

export interface Feature { n: string; icon: string; title: string; body: string; }
export interface Step { n: string; title: string; body: string; }
export interface StepImage { src: string; alt: string; }

export const FEATURES: Feature[] = [
  { n: '01', icon: 'schedule', title: '20-min advance order', body: 'Schedule your order up to 20 minutes before you arrive. It is ready when you are.' },
  { n: '02', icon: 'credit_card', title: 'Pay online', body: 'UPI, card, or netbanking at checkout, or pay at the counter. Your call.' },
  { n: '03', icon: 'chat', title: 'WhatsApp updates', body: 'Order status lands in WhatsApp at every step. No new app to install.' },
];

export const STEPS: Step[] = [
  { n: '1', title: 'Pick your café', body: 'Browse menus from cafés near you. No login needed to look around.' },
  { n: '2', title: 'Customize & pay', body: 'Build your order, choose a pickup slot, and check out in a tap.' },
  { n: '3', title: 'Grab & go', body: 'Skip the queue. Collect your order from the counter when it is ready.' },
];

// Unsplash CDN — placeholder café imagery; swap to owned photos before prod.
export const STEP_IMAGES: StepImage[] = [
  { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85', alt: 'Warm café interior' },
  { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85', alt: 'Barista pouring latte art' },
];
```

- [ ] **Step 2b: Add `--gb-r-card` token to `globals.css`**

Master's `.gb-app` block lacks it. Inside the `.gb-app { ... }` rule in `grabit/src/app/globals.css` (put it right after the `--gb-shadow-bar:` line), add:

```css
  --gb-r-card: 22px;
```

- [ ] **Step 3: Replace `LandingClient.tsx` with the new shell**

This file already exists (old 675-line splash). Read it, then fully overwrite with:

```tsx
// grabit/src/app/LandingClient.tsx
'use client';

export default function LandingClient() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <main data-landing-root style={{ minHeight: '100dvh' }} />
    </div>
  );
}
```

- [ ] **Step 4: Swap the route in `page.tsx`**

Replace the entire file:

```tsx
// grabit/src/app/page.tsx
import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'Grabit — Order ahead, skip the queue',
  description: 'Pre-order from cafés near you. Ready when you arrive, no queue. Now in Delhi.',
  openGraph: {
    title: 'Grabit — Order ahead, skip the queue',
    description: 'Pre-order from cafés near you. Ready when you arrive, no queue.',
    url: 'https://grabit365.com',
    siteName: 'Grabit',
  },
};

export default function RootPage() {
  return <LandingClient />;
}
```

- [ ] **Step 5: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 6: Verify route renders, guest-accessible, no redirect**

Start preview `grabit`, then:
```js
window.location.href = 'http://localhost:3004/'
```
Then eval:
```js
(() => ({ hasGbApp: !!document.querySelector('.gb-app'), hasRoot: !!document.querySelector('[data-landing-root]'), path: location.pathname }))()
```
Expected: `{ hasGbApp: true, hasRoot: true, path: "/" }` (path is `/`, NOT redirected to `/home`).

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/content.ts src/app/LandingClient.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat(grabit): landing shell at / (replace old splash), marketing metadata + gb-r-card token"
```

---

### Task 2: LandingNav

Frosted top nav with browse-first + partner CTAs.

**Files:**
- Create: `grabit/src/components/landing/LandingNav.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `MS` from `@/components/gb/kit`.
- Produces: `LandingNav` default export, mounted first in `LandingClient`.

- [ ] **Step 1: Write `LandingNav.tsx`**

```tsx
// grabit/src/components/landing/LandingNav.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function LandingNav() {
  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(250,246,240,.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gb-line-2)',
      }}
    >
      <nav style={{ maxWidth: 1120, margin: '0 auto', height: 68, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="storefront" size={24} color="var(--gb-primary)" />
          <span className="gb-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--gb-ink)' }}>Grabit</span>
        </Link>
        <div className="gb-nav-center" style={{ display: 'none', alignItems: 'center', gap: 28 }}>
          <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>How it works</a>
          <Link href="/partner" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>For cafés</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/partner" style={{ display: 'none', fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)', padding: '9px 12px' }} className="gb-nav-partner">
            Partner with us
          </Link>
          <Link href="/home" style={{ background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '10px 18px', borderRadius: 999 }}>
            Browse cafés
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Reveal the partner link on ≥640px via globals**

Add to `grabit/src/app/globals.css` at the end of the `.gb-app` block region (after the `@keyframes gb-blink` line):

```css
@media (min-width: 640px) { .gb-nav-partner { display: inline-flex !important; } }
@media (min-width: 768px) { .gb-nav-center { display: flex !important; } }
```

- [ ] **Step 3: Mount in `LandingClient.tsx`**

```tsx
// grabit/src/app/LandingClient.tsx
'use client';
import LandingNav from '@/components/landing/LandingNav';

export default function LandingClient() {
  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <LandingNav />
      <main data-landing-root style={{ minHeight: '100dvh' }} />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify nav links**

Reload `/`, then eval:
```js
(() => {
  const links = [...document.querySelectorAll('header a')].map(a => ({ t: a.textContent.trim(), href: a.getAttribute('href') }));
  return links;
})()
```
Expected: includes `{ t: "Browse cafés", href: "/home" }` and `{ t: "Partner with us", href: "/partner" }`.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/LandingNav.tsx src/app/LandingClient.tsx src/app/globals.css
git commit -m "feat(grabit): landing nav with browse-first + partner CTAs"
```

---

### Task 3: Hero (dark, food-forward)

**Files:**
- Create: `grabit/src/components/landing/Hero.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `next/image`, `framer-motion`.
- Produces: `Hero` default export.

- [ ] **Step 1: Confirm `images.unsplash.com` is allowed by next/image**

Run:
```bash
cd grabit && grep -n "unsplash" next.config.* 2>/dev/null || echo "NOT CONFIGURED"
```
If `NOT CONFIGURED`, add to `next.config.ts` `images.remotePatterns` an entry `{ protocol: 'https', hostname: 'images.unsplash.com' }`. If already present, skip. (The gb app already renders Unsplash via `ph()`, so it is likely configured; verify before assuming.)

- [ ] **Step 2: Write `Hero.tsx`**

```tsx
// grabit/src/components/landing/Hero.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 24 } },
};

export default function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '92dvh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      <Image
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90"
        alt="Café counter with fresh coffee"
        fill priority className="object-cover" style={{ objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,18,12,.35) 0%, rgba(30,18,12,0) 30%, rgba(30,18,12,.88) 100%)' }} />
      <motion.div
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1120, margin: '0 auto', padding: '0 22px 64px' }}
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
      >
        <motion.span variants={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gb-primary)', color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, marginBottom: 18 }}>
          Now in Delhi
        </motion.span>
        <motion.h1 variants={item} className="gb-serif" style={{ color: '#fff', fontSize: 'clamp(40px, 8vw, 76px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-.02em', maxWidth: 680, margin: 0 }}>
          Order ahead.<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Skip the queue.</span>
        </motion.h1>
        <motion.p variants={item} style={{ color: 'rgba(255,255,255,.85)', fontSize: 18, lineHeight: 1.5, maxWidth: 460, margin: '18px 0 0' }}>
          Pre-order from cafés near you. It is ready when you arrive.
        </motion.p>
        <motion.div variants={item} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
          <Link href="/home" style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 16, fontWeight: 800, padding: '15px 26px', borderRadius: 999 }}>Browse cafés</Link>
          <Link href="/partner" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '15px 26px', borderRadius: 999, backdropFilter: 'blur(8px)' }}>Partner with us</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 3: Mount below nav in `LandingClient.tsx`**

Replace the `<main>` line:
```tsx
      <main data-landing-root>
        <Hero />
      </main>
```
Add import: `import Hero from '@/components/landing/Hero';`

- [ ] **Step 4: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify hero content + CTA targets**

Reload `/`, eval:
```js
(() => {
  const h1 = document.querySelector('[data-landing-root] h1')?.innerText;
  const ctas = [...document.querySelectorAll('[data-landing-root] section a')].map(a => a.getAttribute('href'));
  return { h1, ctas };
})()
```
Expected: `h1` contains "Order ahead." and "Skip the queue."; `ctas` includes `/home` and `/partner`.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/Hero.tsx src/app/LandingClient.tsx next.config.ts
git commit -m "feat(grabit): landing hero, dark food-forward with dual CTAs"
```

---

### Task 4: TrustBand + HowItWorks

Light qualitative trust strip, then the dark 2-column how-it-works band.

**Files:**
- Create: `grabit/src/components/landing/TrustBand.tsx`
- Create: `grabit/src/components/landing/HowItWorks.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `STEPS`, `STEP_IMAGES` from `content.ts`; `MS` from `@/components/gb/kit`; `next/image`, `framer-motion`.
- Produces: `TrustBand`, `HowItWorks` default exports.

- [ ] **Step 1: Write `TrustBand.tsx`**

```tsx
// grabit/src/components/landing/TrustBand.tsx
'use client';
import { MS } from '@/components/gb/kit';

const PILLARS = [
  { icon: 'bolt', label: 'Skip the wait' },
  { icon: 'payments', label: 'Pay online or at counter' },
  { icon: 'chat', label: 'WhatsApp updates' },
];

export default function TrustBand() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '40px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
        {PILLARS.map((p) => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px' }}>
            <MS name={p.icon} size={24} fill color="var(--gb-primary)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{p.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `HowItWorks.tsx`**

```tsx
// grabit/src/components/landing/HowItWorks.tsx
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { STEPS, STEP_IMAGES } from './content';

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: 'var(--gb-hero)', color: '#fff', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 56, gridTemplateColumns: '1fr', alignItems: 'center' }} className="gb-hiw-grid">
        <div>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 40px' }}>
            From browse to pickup<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>in minutes.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n} style={{ display: 'flex', gap: 20 }}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.1 }}>
                <div style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{s.n}</div>
                <div>
                  <h3 className="gb-serif" style={{ fontSize: 20, fontWeight: 600, margin: '4px 0 6px' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, lineHeight: 1.5, margin: 0 }}>{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="gb-hiw-imgs">
          {STEP_IMAGES.map((img, i) => (
            <div key={img.src} style={{ position: 'relative', height: 260, marginTop: i === 1 ? 40 : 0, borderRadius: 20, overflow: 'hidden' }}>
              <Image src={img.src} alt={img.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add responsive grid rules to `globals.css`**

Append near the other `.gb-app` media rules:

```css
.gb-hiw-imgs { display: none !important; }
@media (min-width: 900px) {
  .gb-hiw-grid { grid-template-columns: 1fr 1fr !important; }
  .gb-hiw-imgs { display: grid !important; }
}
```

- [ ] **Step 4: Mount in `LandingClient.tsx`**

Add imports and place after `<Hero />`:
```tsx
        <Hero />
        <TrustBand />
        <HowItWorks />
```
Imports: `import TrustBand from '@/components/landing/TrustBand';` and `import HowItWorks from '@/components/landing/HowItWorks';`

- [ ] **Step 5: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Verify sections present**

Reload `/`, eval:
```js
(() => {
  const hiw = document.querySelector('#how-it-works');
  return { howItWorks: !!hiw, stepCount: hiw ? hiw.querySelectorAll('h3').length : 0, darkBg: hiw ? getComputedStyle(hiw).backgroundImage.includes('gradient') : false };
})()
```
Expected: `{ howItWorks: true, stepCount: 3, darkBg: true }`.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/TrustBand.tsx src/components/landing/HowItWorks.tsx src/app/LandingClient.tsx src/app/globals.css
git commit -m "feat(grabit): landing trust band + how-it-works dark section"
```

---

### Task 5: WhyGrabit feature tiles

**Files:**
- Create: `grabit/src/components/landing/WhyGrabit.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `FEATURES` from `content.ts`; `MS` from `@/components/gb/kit`; `framer-motion`.
- Produces: `WhyGrabit` default export.

- [ ] **Step 1: Write `WhyGrabit.tsx`**

Tile cluster (not 3 equal columns): first tile spans wide on desktop.

```tsx
// grabit/src/components/landing/WhyGrabit.tsx
'use client';
import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { FEATURES } from './content';

export default function WhyGrabit() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)' }}>
          Why Grabit
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }} className="gb-why-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 }}
              style={{ position: 'relative', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-card)', padding: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-card)', gridColumn: i === 0 ? 'span 1' : 'auto' }}
              className={i === 0 ? 'gb-why-lead' : undefined}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <MS name={f.icon} size={28} fill color="var(--gb-primary)" />
              </div>
              <h3 className="gb-serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: 'var(--gb-text-strong)' }}>{f.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--gb-muted)', margin: 0 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add responsive tile-cluster rules to `globals.css`**

```css
@media (min-width: 820px) {
  .gb-why-grid { grid-template-columns: 1fr 1fr !important; }
  .gb-why-lead { grid-column: span 2 !important; }
}
```

- [ ] **Step 3: Mount after `<HowItWorks />`**

```tsx
        <HowItWorks />
        <WhyGrabit />
```
Import: `import WhyGrabit from '@/components/landing/WhyGrabit';`

- [ ] **Step 4: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Verify 3 tiles render**

Reload `/`, eval:
```js
(() => { const tiles = document.querySelectorAll('.gb-why-grid > div'); return { count: tiles.length, hasLead: !!document.querySelector('.gb-why-lead') }; })()
```
Expected: `{ count: 3, hasLead: true }`.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/WhyGrabit.tsx src/app/LandingClient.tsx src/app/globals.css
git commit -m "feat(grabit): landing why-grabit feature tiles"
```

---

### Task 6: ProductPreview (flat phone mockup)

Self-contained flat scroll-reveal of the real `/home` menu flow. Reuses the mockup markup from the old landing but drops the 3D ContainerScroll wrapper (Zomato-flat).

**Files:**
- Create: `grabit/src/components/landing/ProductPreview.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `next/image`, `framer-motion`.
- Produces: `ProductPreview` default export.

- [ ] **Step 1: Write `ProductPreview.tsx`**

```tsx
// grabit/src/components/landing/ProductPreview.tsx
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ITEMS = [
  { name: 'Cold Brew', desc: 'Smooth 12-hour steep', price: '₹220', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
  { name: 'Flat White', desc: 'Double ristretto, silky foam', price: '₹280', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' },
  { name: 'Matcha Latte', desc: 'Ceremonial grade, oat milk', price: '₹320', img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80' },
];

export default function ProductPreview() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '48px 22px 88px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)' }}>
          Order in seconds.<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-primary)' }}>Pick up in minutes.</span>
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          style={{ maxWidth: 380, margin: '0 auto', background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-pop)', border: '1px solid var(--gb-line-2)', textAlign: 'left' }}>
          <div style={{ position: 'relative', height: 130 }}>
            <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=85" alt="Café" fill loading="lazy" style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 16, color: '#fff' }}>
              <div className="gb-serif" style={{ fontSize: 20, fontWeight: 600 }}>The Raydee Cafe</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>DTU, Delhi · 15 min prep</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ITEMS.map((it) => (
              <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, background: 'var(--gb-surface)' }}>
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
                  <Image src={it.img} alt={it.name} fill loading="lazy" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gb-muted)' }}>{it.desc}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.price}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px 16px' }}>
            <div style={{ width: '100%', padding: '13px 0', textAlign: 'center', borderRadius: 999, color: '#fff', fontSize: 14, fontWeight: 800, background: 'var(--gb-primary)' }}>
              View cart · ₹500 → Pickup 10:30 AM
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Mount after `<WhyGrabit />`**

```tsx
        <WhyGrabit />
        <ProductPreview />
```
Import: `import ProductPreview from '@/components/landing/ProductPreview';`

- [ ] **Step 3: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Verify no gsap/ogl in the render path**

Reload `/`, then eval (checks nothing pulled the heavy libs into the page):
```js
(() => ({ preview: !!document.querySelector('[data-landing-root]'), itemRows: document.querySelectorAll('[data-landing-root] section:last-of-type img').length >= 0 }))()
```
Then confirm source: `cd grabit && grep -rn "from 'gsap'\|from \"gsap\"\|CafeCircularGallery\|ReadyToJoinRitual\|TestimonialsSection\|from 'ogl'" src/app/LandingClient.tsx src/components/landing/`
Expected: no matches (empty).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ProductPreview.tsx src/app/LandingClient.tsx
git commit -m "feat(grabit): landing product preview (flat phone mockup)"
```

---

### Task 7: PartnerPitch + FinalCTA + LandingFooter

The café-acquisition dark band, the closing CTA, and the footer.

**Files:**
- Create: `grabit/src/components/landing/PartnerPitch.tsx`
- Create: `grabit/src/components/landing/FinalCTA.tsx`
- Create: `grabit/src/components/landing/LandingFooter.tsx`
- Modify: `grabit/src/app/LandingClient.tsx`

**Interfaces:**
- Consumes: `Link` from `next/link`; `MS` from `@/components/gb/kit`.
- Produces: `PartnerPitch`, `FinalCTA`, `LandingFooter` default exports.

- [ ] **Step 1: Write `PartnerPitch.tsx`**

```tsx
// grabit/src/components/landing/PartnerPitch.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

const BENEFITS = [
  { icon: 'point_of_sale', title: 'Your own POS', body: 'Grabit orders land in your Omega POS at the counter, next to your walk-in orders.' },
  { icon: 'savings', title: 'Keep your margin', body: 'A direct pre-order channel, not a commission-heavy aggregator listing.' },
  { icon: 'notifications_active', title: 'Never miss an order', body: 'A tablet at the counter alerts you the moment a pickup order comes in.' },
];

export default function PartnerPitch() {
  return (
    <section style={{ background: 'var(--gb-hero)', color: '#fff', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-peach)' }}>For cafés</span>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px' }}>
            Run a café? Own your orders.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,.78)', margin: '0 0 32px' }}>
            Take pre-orders from customers before they arrive, and manage them right at your counter.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginBottom: 36 }} className="gb-partner-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 'var(--gb-r-card)', padding: 24 }}>
              <MS name={b.icon} size={28} fill color="var(--gb-peach)" />
              <h3 className="gb-serif" style={{ fontSize: 19, fontWeight: 600, margin: '14px 0 6px' }}>{b.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,.7)', margin: 0 }}>{b.body}</p>
            </div>
          ))}
        </div>
        <Link href="/partner" style={{ display: 'inline-block', background: '#fff', color: 'var(--gb-ink)', fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `FinalCTA.tsx`**

```tsx
// grabit/src/components/landing/FinalCTA.tsx
'use client';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px', textAlign: 'center' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 6vw, 52px)', fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 24px', color: 'var(--gb-text-strong)' }}>
          Your coffee, ready when you are.
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link href="/home" style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Start ordering</Link>
          <Link href="/partner" style={{ background: 'var(--gb-card)', color: 'var(--gb-text)', border: '1px solid var(--gb-line-3)', fontSize: 16, fontWeight: 700, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `LandingFooter.tsx`**

```tsx
// grabit/src/components/landing/LandingFooter.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function LandingFooter() {
  return (
    <footer style={{ background: 'var(--gb-ink)', color: 'rgba(255,255,255,.7)', padding: '48px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="storefront" size={22} color="var(--gb-peach)" />
          <span className="gb-serif" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Grabit</span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, fontWeight: 600 }}>
          <Link href="/home" style={{ color: 'rgba(255,255,255,.7)' }}>Browse cafés</Link>
          <Link href="/partner" style={{ color: 'rgba(255,255,255,.7)' }}>Partner with us</Link>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,.7)' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,.7)' }}>Terms</Link>
        </nav>
      </div>
      <div style={{ maxWidth: 1120, margin: '24px auto 0', fontSize: 12.5, color: 'rgba(255,255,255,.45)' }}>© 2026 Grabit. Now in Delhi.</div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify `/privacy` and `/terms` exist in the app**

Run:
```bash
cd grabit && ls src/app/privacy/page.tsx src/app/terms/page.tsx 2>/dev/null || echo "MISSING — change footer links to https://grabit365.com/privacy etc. or remove"
```
If `MISSING`, drop the Privacy/Terms links from the footer in Step 3 before committing (do not ship dead internal links).

- [ ] **Step 5: Add responsive partner-grid rule to `globals.css`**

```css
@media (min-width: 820px) { .gb-partner-grid { grid-template-columns: repeat(3, 1fr) !important; } }
```

- [ ] **Step 6: Mount the three sections in `LandingClient.tsx`**

```tsx
        <ProductPreview />
        <PartnerPitch />
        <FinalCTA />
      </main>
      <LandingFooter />
```
Imports: `PartnerPitch`, `FinalCTA`, `LandingFooter` from `@/components/landing/...`.

- [ ] **Step 7: Typecheck**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 8: Verify partner + final CTAs**

Reload `/`, eval:
```js
(() => {
  const hrefs = [...document.querySelectorAll('[data-landing-root] a, footer a')].map(a => a.getAttribute('href'));
  return { partner: hrefs.filter(h => h === '/partner').length, home: hrefs.filter(h => h === '/home').length };
})()
```
Expected: `partner >= 3` and `home >= 3` (nav + hero + partner band + final + footer).

- [ ] **Step 9: Commit**

```bash
git add src/components/landing/PartnerPitch.tsx src/components/landing/FinalCTA.tsx src/components/landing/LandingFooter.tsx src/app/LandingClient.tsx src/app/globals.css
git commit -m "feat(grabit): landing partner pitch, final CTA, footer"
```

---

### Task 8: Full-page verification pass

No new files — validate the assembled page against the spec's success criteria.

**Files:** none (verification + fixes only).

- [ ] **Step 1: Typecheck the whole app**

Run: `cd grabit && ./node_modules/.bin/tsc --noEmit`
Expected: clean.

- [ ] **Step 2: Guest-accessibility + no-redirect**

Fresh preview (no auth cookie), navigate to `http://localhost:3004/`, eval:
```js
(() => ({ path: location.pathname, gbApp: !!document.querySelector('.gb-app') }))()
```
Expected: `{ path: "/", gbApp: true }`.

- [ ] **Step 3: Section order + count**

```js
(() => [...document.querySelectorAll('[data-landing-root] > section, footer')].map(s => s.id || s.tagName))()
```
Expected: 7 entries — hero, trust, `how-it-works`, why, product, partner, final — plus `FOOTER`.

- [ ] **Step 4: No forbidden libs/components mounted**

```bash
cd grabit && grep -rn "gsap\|ogl\|CafeCircularGallery\|ReadyToJoinRitual\|TestimonialsSection" src/app/LandingClient.tsx src/components/landing/ || echo "CLEAN"
```
Expected: `CLEAN`.

- [ ] **Step 5: Responsive — no horizontal scroll at 375px and 1280px**

Resize preview to 375px, eval `document.documentElement.scrollWidth <= window.innerWidth + 1`; resize to 1280px, eval again.
Expected: `true` at both widths.

- [ ] **Step 6: Nav both CTAs route correctly**

Click "Browse cafés" → confirm `location.pathname === '/home'`. Back. Click "Partner with us" → confirm `location.pathname === '/partner'`.

- [ ] **Step 7: Push branch and open PR**

```bash
git push -u origin feat/grabit-landing-zomato
gh auth switch --user gradient365
gh pr create --repo KineticTechno/grabitui --base master --head feat/grabit-landing-zomato \
  --title "feat(grabit): Zomato-style landing at /" \
  --body "Replaces the / -> /home redirect with a food-forward marketing landing. Browse cafés -> /home (browse-first), Partner with us -> /partner. Warm-editorial .gb-app theme with cocoa dark bands. Spec: docs/superpowers/specs/2026-07-03-grabit-landing-zomato-design.md"
gh auth switch --user sahilKumar1122
```

---

## Notes for the executor

- The gb consumer components (`src/components/gb/kit.tsx`, `cards.tsx`) are the style reference: inline styles + `--gb-*` vars, `MS` for icons, `gb-serif` for headings. Match them.
- If `next.config` blocks a remote image host, add it to `images.remotePatterns` (Task 3 Step 1 covers Unsplash).
- This plan interacts with open PR #10 (which also touches `src/app/page.tsx` and `globals.css`). Branch off `master`; if #10 merges first, rebase and re-verify Steps that touch `globals.css` / `page.tsx`.
