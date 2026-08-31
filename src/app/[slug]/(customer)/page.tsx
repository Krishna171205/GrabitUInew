import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import MenuClient from './MenuClient';
import { MS } from '@/components/gb/kit';
import { SITE_NAME, canonicalUrl, cafeSchema, breadcrumbList, type CafeSeoInput } from '@/lib/seo';

async function getCafeMenu(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`, {
      next: { revalidate: 300 }
    });
    // A 404 means this slug genuinely has no cafe; anything else that isn't ok
    // (500, timeout upstream, etc.) is a server problem, not a missing cafe -
    // the empty state needs to tell those two apart so "try again" only shows
    // when trying again could actually help.
    if (!res.ok) return { cafe: null, error: res.status === 404 ? 'not_found' : 'server_error', items: [], addons: [], variations: [], option_groups: [] };
    return res.json();
  } catch {
    return { cafe: null, error: 'server_error', items: [], addons: [], variations: [], option_groups: [] };
  }
}

// Fetched fresh (not cached with the menu) so the page renders open/closed correct on
// first paint — no client-side flip after mount.
async function getCafeStatus(slug: string): Promise<boolean | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes/${slug}/status`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    const d = await res.json();
    return d.acceptingOrders !== false;
  } catch { return undefined; }
}

// Public, and fresh rather than cached with the menu: an offer that just ended must
// stop being advertised on the next load, not five minutes later.
async function getOffers(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/offers/${slug}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getTopItems(cafeId: number, token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/top-items?cafeId=${cafeId}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getFavorites(cafeId: number, token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/favorites?cafeId=${cafeId}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getCustomerProfile(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store'
    });
    if (!res.ok) return { name: null, isProfileComplete: false };
    const d = await res.json();
    return { name: d.name ?? null, isProfileComplete: !!(d.name && d.email) };
  } catch { return { name: null, isProfileComplete: false }; }
}

/**
 * A cafe page is the only page on the site that answers "<cafe name> order
 * online" / "<cafe name> menu", which is the highest-intent query this product
 * has. Without its own metadata it inherits the root layout's canonical and
 * points every cafe at the homepage, so none of them can be indexed.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Same fetch options as the page body, so this is deduped rather than doubled.
  const { cafe } = await getCafeMenu(slug);
  if (!cafe) return { title: 'Cafe not found', robots: { index: false, follow: true } };

  const where = [cafe.address?.trim(), cafe.city].filter(Boolean).join(', ');
  const title = `${cafe.name}: Order Ahead & Menu`;
  const description =
    `Order ahead from ${cafe.name}${where ? ` in ${where}` : ''} on ${SITE_NAME}. ` +
    'See the live menu, pay online with UPI or card, and pick your order up at the counter without queueing.';

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/${slug}`) },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: SITE_NAME,
      url: canonicalUrl(`/${slug}`),
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(cafe.cover_url ? { images: [{ url: cafe.cover_url, alt: cafe.name }] } : {}),
    },
  };
}

export default async function HomePage(
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ table?: string; craving?: string }> },
) {
  const { slug } = await params;
  const { table, craving } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('grabbit_customer_token')?.value ?? null;

  const { cafe, error, items, addons, variations, option_groups: optionGroups } = await getCafeMenu(slug);
  if (!cafe) {
    const notFound = error !== 'server_error';
    return (
      <div className="gb-app" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 320 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center' }}>
            <MS name={notFound ? 'storefront' : 'wifi_off'} size={30} color="var(--gb-primary)" />
          </div>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500 }}>
            {notFound ? 'Cafe not found' : "Couldn't load this cafe"}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500 }}>
            {notFound
              ? "This cafe link doesn't exist or may have moved."
              : 'Something went wrong on our end. Please try again in a moment.'}
          </div>
          <Link href={notFound ? '/home' : `/${slug}`} style={{ background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', borderRadius: 14, padding: '13px 22px', fontSize: 15, fontWeight: 800 }}>
            {notFound ? 'Browse cafés' : 'Try again'}
          </Link>
        </div>
      </div>
    );
  }

  const [[profile, topItems, favorites, acceptingOrders], offers] = await Promise.all([
    token
      ? Promise.all([getCustomerProfile(token), getTopItems(cafe.id, token), getFavorites(cafe.id, token), getCafeStatus(slug)])
      : Promise.all([{ name: null, isProfileComplete: false }, [], [], getCafeStatus(slug)]),
    getOffers(slug),
  ]);

  const jsonLd = [
    cafeSchema({ ...(cafe as CafeSeoInput), slug }),
    breadcrumbList([
      { name: 'Cafes', path: '/cafes' },
      { name: cafe.name, path: `/${slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <MenuClient
      slug={slug}
      cafe={cafe}
      items={items}
      addons={addons ?? []}
      variations={variations ?? []}
      optionGroups={optionGroups ?? []}
      customerName={profile.name}
      topItems={topItems}
      favorites={favorites}
      offers={offers}
      isLoggedIn={!!token}
      table={table ?? null}
      initialQuery={craving ?? null}
      initialAcceptingOrders={acceptingOrders}
    />
    </>
  );
}
