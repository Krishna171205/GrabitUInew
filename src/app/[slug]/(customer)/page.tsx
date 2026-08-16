import { cookies } from 'next/headers';
import MenuClient from './MenuClient';

async function getCafeMenu(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return { cafe: null, items: [], addons: [] };
  return res.json();
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

export default async function HomePage(
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ table?: string; craving?: string }> },
) {
  const { slug } = await params;
  const { table, craving } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('grabbit_customer_token')?.value ?? null;

  const { cafe, items, addons } = await getCafeMenu(slug);
  if (!cafe) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--g-muted)' }}>Cafe not found</p>
      </div>
    );
  }

  const [[profile, topItems, favorites, acceptingOrders], offers] = await Promise.all([
    token
      ? Promise.all([getCustomerProfile(token), getTopItems(cafe.id, token), getFavorites(cafe.id, token), getCafeStatus(slug)])
      : Promise.all([{ name: null, isProfileComplete: false }, [], [], getCafeStatus(slug)]),
    getOffers(slug),
  ]);

  return (
    <MenuClient
      slug={slug}
      cafe={cafe}
      items={items}
      addons={addons ?? []}
      customerName={profile.name}
      topItems={topItems}
      favorites={favorites}
      offers={offers}
      isLoggedIn={!!token}
      table={table ?? null}
      initialQuery={craving ?? null}
      initialAcceptingOrders={acceptingOrders}
    />
  );
}
