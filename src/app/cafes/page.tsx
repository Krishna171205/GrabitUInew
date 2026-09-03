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
  // Without this guard, a missing NEXT_PUBLIC_API_URL produces the malformed URL
  // "undefined/api/grabit/cafes". A real absolute URL that never responds is bounded by
  // the AbortSignal below - but Next's own fetch instrumentation for `next: {revalidate}`
  // does not honor that signal for a malformed URL during `next build`'s static
  // generation: the promise never settles at all, confirmed by reproducing it locally
  // (fetch started, never resolved or rejected) against the exact env this repo's CI runs
  // with, where the var is genuinely unset. Not relying on a signal here; not calling
  // fetch at all is what actually bounds it.
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    // FALLBACK MOCK DATA FOR UI TESTING WHILE BACKEND IS DOWN
    return [
      {
        id: 1,
        name: 'Brew & Brew',
        slug: 'brew-and-brew',
        address: 'DTU Main Campus',
        city: 'New Delhi',
        acceptingOrders: true,
        cover_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 0.4,
        prepTimeMinutes: '4–6',
        rating: 4.8,
        reviewCount: 184,
        tags: ['Specialty Coffee', 'Bakery', 'Quick Bites'],
        latitude: 28.7495,
        longitude: 77.1170
      },
      {
        id: 2,
        name: 'Mic Mac',
        slug: 'mic-mac',
        address: 'Near Mech Block',
        city: 'New Delhi',
        acceptingOrders: false,
        cover_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 0.8,
        prepTimeMinutes: '5–8',
        rating: 4.5,
        reviewCount: 92,
        tags: ['Quick Bites', 'Cold Brew', 'Snacks'],
        latitude: 28.7510,
        longitude: 77.1190
      },
      {
        id: 3,
        name: 'The Raydee Cafe',
        slug: 'raydee-cafe',
        address: 'North Campus',
        city: 'New Delhi',
        acceptingOrders: true,
        cover_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 2.1,
        prepTimeMinutes: '7–10',
        rating: 4.9,
        reviewCount: 230,
        tags: ['Artisan Bakery', 'Specialty Coffee', 'Breakfast'],
        latitude: 28.6920,
        longitude: 77.2110
      },
      {
        id: 4,
        name: 'Blue Tokai',
        slug: 'blue-tokai',
        address: 'Civil Lines',
        city: 'New Delhi',
        acceptingOrders: true,
        cover_url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 4.5,
        prepTimeMinutes: '5–8',
        rating: 4.9,
        reviewCount: 410,
        tags: ['Specialty Coffee', 'Roastery', 'Sourdough'],
        latitude: 28.6750,
        longitude: 77.2250
      },
      {
        id: 5,
        name: 'Third Wave Coffee',
        slug: 'third-wave',
        address: 'Rajinder Nagar',
        city: 'New Delhi',
        acceptingOrders: true,
        cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 7.2,
        prepTimeMinutes: '6–9',
        rating: 4.7,
        reviewCount: 156,
        tags: ['Manual Brew', 'Pastries', 'Specialty Coffee'],
        latitude: 28.6410,
        longitude: 77.1820
      },
      {
        id: 6,
        name: 'Kaffa Cerrado',
        slug: 'kaffa-cerrado',
        address: 'Okhla Phase 3',
        city: 'New Delhi',
        acceptingOrders: true,
        cover_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000',
        distanceKm: 9.8,
        prepTimeMinutes: '5–8',
        rating: 4.8,
        reviewCount: 128,
        tags: ['Single Origin', 'Specialty Coffee', 'Cold Brew'],
        latitude: 28.5355,
        longitude: 77.2710
      }
    ];
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
    <div className="gb-app bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingNav />
      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <CafeListing cafes={cafes} />
      </main>
      <LandingFooter />
    </div>
  );
}
