import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import MenuClient from './MenuClient';
import { MS } from '@/components/gb/kit';
import { SITE_NAME, canonicalUrl, cafeSchema, breadcrumbList, type CafeSeoInput } from '@/lib/seo';

function getFallbackMenu(slug: string) {
  const cafeNames: Record<string, string> = {
    'brew-and-brew': 'Brew & Brew',
    'mic-mac': 'Mic Mac',
    'raydee-cafe': 'The Raydee Cafe',
    'raydee': 'The Raydee Cafe',
    'blue-tokai': 'Blue Tokai',
    'third-wave': 'Third Wave Coffee',
    'kaffa-cerrado': 'Kaffa Cerrado',
  };

  const name = cafeNames[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const cafe = {
    id: 1,
    name,
    slug,
    address: 'Campus Food Court, Gate 2',
    city: 'New Delhi',
    opening_time: '08:30:00',
    closing_time: '22:00:00',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000',
    logo_url: null,
    latitude: 28.7495,
    longitude: 77.1170,
    hours: [
      { day: 'Monday', opens: '08:30', closes: '22:00', is_closed: false },
      { day: 'Tuesday', opens: '08:30', closes: '22:00', is_closed: false },
      { day: 'Wednesday', opens: '08:30', closes: '22:00', is_closed: false },
      { day: 'Thursday', opens: '08:30', closes: '22:00', is_closed: false },
      { day: 'Friday', opens: '08:30', closes: '22:00', is_closed: false },
      { day: 'Saturday', opens: '09:00', closes: '21:00', is_closed: false },
      { day: 'Sunday', opens: '09:00', closes: '21:00', is_closed: false },
    ]
  };

  const items = [
    {
      id: 101,
      name: 'Signature Cold Brew',
      slug: `${slug}-cold-brew`,
      description: 'Slow-steeped for 18 hours. Smooth, bold, and refreshing.',
      price: 180,
      category: 'drinks' as const,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 1,
    },
    {
      id: 102,
      name: 'Oat Milk Flat White',
      slug: `${slug}-flat-white`,
      description: 'Double shot of rich espresso with microfoam oat milk.',
      price: 210,
      category: 'drinks' as const,
      image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 2,
    },
    {
      id: 103,
      name: 'Classic Iced Latte',
      slug: `${slug}-iced-latte`,
      description: 'Espresso poured over chilled milk and crystal ice.',
      price: 190,
      category: 'drinks' as const,
      image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 3,
    },
    {
      id: 104,
      name: 'Butter Croissant',
      slug: `${slug}-croissant`,
      description: 'Flaky French pastry baked golden crisp each morning.',
      price: 130,
      category: 'food' as const,
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 4,
    },
    {
      id: 105,
      name: 'Truffle Mushroom Grilled Melt',
      slug: `${slug}-grilled-melt`,
      description: 'Artisan sourdough with melted cheddar, mozzarella, and sauteed mushrooms.',
      price: 240,
      category: 'food' as const,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 5,
    },
    {
      id: 106,
      name: 'Belgian Chocolate Brownie',
      slug: `${slug}-brownie`,
      description: 'Warm fudgy dark chocolate brownie topped with chocolate drizzle.',
      price: 150,
      category: 'desserts' as const,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
      is_available: true,
      is_veg: true,
      display_order: 6,
    }
  ];

  return {
    cafe,
    items,
    addons: [],
    variations: [],
    option_groups: [],
    error: null,
  };
}

async function getCafeMenu(slug: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) return getFallbackMenu(slug);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return getFallbackMenu(slug);
    const data = await res.json();
    if (!data || !data.cafe) return getFallbackMenu(slug);
    return data;
  } catch {
    return getFallbackMenu(slug);
  }
}

// Fetched fresh (not cached with the menu) so the page renders open/closed correct on
// first paint — no client-side flip after mount.
async function getCafeStatus(slug: string): Promise<boolean | undefined> {
  if (!process.env.NEXT_PUBLIC_API_URL) return true;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes/${slug}/status`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return true;
    const d = await res.json();
    return d.acceptingOrders !== false;
  } catch { return true; }
}

// Public, and fresh rather than cached with the menu: an offer that just ended must
// stop being advertised on the next load, not five minutes later.
async function getOffers(slug: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/offers/${slug}`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getTopItems(cafeId: number, token: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/top-items?cafeId=${cafeId}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getFavorites(cafeId: number, token: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) return [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/favorites?cafeId=${cafeId}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getCustomerProfile(token: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) return { name: null, isProfileComplete: false };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(2000)
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
