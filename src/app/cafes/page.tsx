import type { Metadata } from 'next';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { type RealCafe } from '@/components/gb/cards';
import { SITE_URL, canonicalUrl, cafeSchema, breadcrumbList, type CafeSeoInput } from '@/lib/seo';
import CafeListing from './CafeListing';

export const metadata: Metadata = {
  title: 'Cafes on Grabbit | LetsGrabbit — Cafe Pre-order Platform',
  description: 'Browse every cafe on Grabbit, see their menus, hours and location, and order ahead.',
  alternates: { canonical: `${SITE_URL}/cafes` },
  robots: { index: true, follow: true },
};

async function getCafes(): Promise<RealCafe[]> {
  const t0 = Date.now();
  // TEMP DIAGNOSTIC - remove before merge. CI is timing out past 60s even with a 10s
  // AbortSignal on this fetch; this logs exactly what happens and when, so the CI log
  // says what's actually hanging instead of guessing from outside it.
  console.error(`[diag cafes] start url=${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes at t=0`);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    });
    console.error(`[diag cafes] fetch resolved ok=${res.ok} status=${res.status} at t=${Date.now() - t0}ms`);
    if (!res.ok) return [];
    const json = await res.json();
    console.error(`[diag cafes] json parsed at t=${Date.now() - t0}ms`);
    return json;
  } catch (e) {
    console.error(`[diag cafes] caught at t=${Date.now() - t0}ms:`, e instanceof Error ? `${e.name}: ${e.message}` : e);
    return [];
  }
}

export default async function CafesPage() {
  const cafes = await getCafes();

  // ItemList of the live cafes, each expanded to its full Restaurant node. The
  // list page is what a crawler reaches first, so naming every cafe here is
  // what gets the individual cafe pages discovered and understood together.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cafes on Grabbit',
      description: 'Every cafe in Delhi you can pre-order from on Grabbit.',
      numberOfItems: cafes.length,
      itemListElement: cafes.map((cafe, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: canonicalUrl(`/${cafe.slug}`),
        item: cafeSchema(cafe as unknown as CafeSeoInput),
      })),
    },
    breadcrumbList([{ name: 'Cafes', path: '/cafes' }]),
  ];

  return (
    <div className="gb-app" style={{ background: 'var(--gb-surface)', color: 'var(--gb-text-strong)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingNav />
      <main style={{ paddingTop: 96, paddingBottom: 40, maxWidth: 1040, margin: '0 auto', padding: '96px 20px 40px' }}>
        <div className="gb-serif" style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-.01em' }}>Cafes on Grabbit</div>
        <div style={{ fontSize: 15, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8 }}>
          Every cafe you can order ahead from. Tap one to see its menu.
        </div>
        <CafeListing cafes={cafes} />
      </main>
      <LandingFooter />
    </div>
  );
}
