import { cookies } from 'next/headers';
import MenuClient from './MenuClient';

async function getCafeMenu(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`, {
    next: { revalidate: 300 }
  });
  if (!res.ok) return { cafe: null, items: [] };
  return res.json();
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
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ table?: string }> },
) {
  const { slug } = await params;
  const { table } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('grabit_customer_token')?.value ?? null;

  const { cafe, items } = await getCafeMenu(slug);
  if (!cafe) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--g-muted)' }}>Cafe not found</p>
      </div>
    );
  }

  const [profile, topItems] = token
    ? await Promise.all([getCustomerProfile(token), getTopItems(cafe.id, token)])
    : [{ name: null, isProfileComplete: false }, []];

  return (
    <MenuClient
      slug={slug}
      cafe={cafe}
      items={items}
      customerName={profile.name}
      topItems={topItems}
      isLoggedIn={!!token}
      table={table ?? null}
    />
  );
}
