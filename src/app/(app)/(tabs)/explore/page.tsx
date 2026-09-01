import Link from 'next/link';
import { MS, NavSpacer } from '@/components/gb/kit';
import { type RealCafe } from '@/components/gb/cards';
import { ExploreSearch } from '@/components/gb/ExploreSearch';

async function getCafes(): Promise<RealCafe[]> {
  // See the matching guard + comment in src/app/cafes/page.tsx: a missing
  // NEXT_PUBLIC_API_URL produces a malformed URL that Next's build-time fetch
  // instrumentation hangs on indefinitely rather than rejecting, signal or not.
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function ExplorePage() {
  const cafes = await getCafes();
  return (
    <div className="gb-shell gb-shell-wide">
      {/* header + search */}
      <div style={{ paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 20, paddingRight: 20, paddingBottom: 8, background: 'var(--gb-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Explore is a bottom-nav tab, not a pushed screen, so this isn't
              browser-back - a guest has no bottom nav at all (TabsLayout only
              renders it when signed in) and no other way back to Home. Desktop
              already has DesktopTopNav for this, hence gb-explore-back hiding
              at that breakpoint - in a class, not inline, since an inline
              style always beats a media-query class rule. */}
          <Link href="/home" aria-label="Back to home" className="gb-explore-back">
            <MS name="arrow_back" size={22} color="var(--gb-ink)" />
          </Link>
          <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.01em' }}>Explore</div>
        </div>
        <ExploreSearch cafes={cafes} />
      </div>
      <NavSpacer />
    </div>
  );
}
