import { cookies } from 'next/headers';
import Link from 'next/link';
import { MS, NavSpacer } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import { ItemCard, CategoryCircle, type RealCafe } from '@/components/gb/cards';
import { LocationPill } from '@/components/gb/LocationPill';
import { CafesNearYou } from '@/components/gb/CafesNearYou';
import { POPULAR, CATEGORIES } from '@/components/gb/data';

interface Me { name: string | null; phone: string | null; avatar_url: string | null; }
interface TopItem { menu_item_id: number; menu_item_name: string; price: number; image_url: string | null; total_ordered: number; }

// Real, live cafés — honest data, no fabricated marketplace stats.
async function getCafes(): Promise<RealCafe[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getMe(token: string): Promise<Me | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// "Order again" = this customer's most-ordered items at their cafe. Cafe-scoped
// (ponytail: uses the first live cafe — there's only one, Raydee, today).
async function getTopItems(token: string, cafeId: number): Promise<TopItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/top-items?cafeId=${cafeId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

// Hero: design uses 60px top to clear the status bar; we clear the real notch instead.
const heroStyle = {
  background: 'var(--gb-hero)', color: '#fff',
  paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 'var(--gb-hero-pad-bottom, 66px)',
} as const;

function SearchBar() {
  return (
    <Link href="/explore" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, background: '#fff', borderRadius: 14, padding: '13px 15px', boxShadow: '0 10px 24px -10px rgba(30,15,5,.5)' }}>
      <MS name="search" size={21} color="#9A8C7B" />
      <span style={{ fontSize: 14.5, color: '#9A8C7B', fontWeight: 500 }}>Search cafés, dishes, drinks</span>
    </Link>
  );
}

function Categories() {
  return (
    <div style={{ padding: '24px 0 0' }}>
      <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500, padding: '0 20px 14px' }}>Browse by craving</div>
      <div className="gb-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 4px' }}>
        {CATEGORIES.map((c) => <CategoryCircle key={c.label} cat={c} />)}
      </div>
    </div>
  );
}

function GuestHome({ cafes }: { cafes: RealCafe[] }) {
  return (
    <div className="gb-shell gb-shell-wide">
      <div style={heroStyle} className="gb-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>Welcome to</div>
            <div className="gb-serif" style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-.01em', marginTop: 2 }}>Grabit</div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#2E2019', padding: '9px 15px', borderRadius: 999, fontSize: 13.5, fontWeight: 800, boxShadow: '0 8px 18px -8px rgba(20,10,5,.5)' }}>
            <MS name="login" size={18} color="var(--gb-primary)" />Sign in
          </Link>
        </div>
        <LocationPill />
        <div className="gb-serif" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 20, fontWeight: 400, maxWidth: 280 }}>
          Browse cafés & menus freely. <span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Sign in when you&apos;re ready to order.</span>
        </div>
        <SearchBar />
      </div>

      {/* sign-in nudge */}
      <div style={{ margin: '-34px 16px 0', position: 'relative', zIndex: 2, background: '#fff', borderRadius: 20, padding: 15, boxShadow: 'var(--gb-shadow-pop)', border: '1px solid #F3DFCB', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <MS name="account_circle" size={24} fill color="var(--gb-primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gb-serif" style={{ fontSize: 17, fontWeight: 500 }}>Sign in to unlock your Grabit</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', marginTop: 2, fontWeight: 600 }}>Reorder, save favourites & track pickups</div>
        </div>
        <Link href="/login" style={{ background: 'var(--gb-ink)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '11px 15px', borderRadius: 12, flex: 'none' }}>Sign in</Link>
      </div>

      {/* popular near you */}
      <div style={{ padding: '24px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 14px' }}>
          <MS name="local_fire_department" size={20} fill color="#C1502E" />
          <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500 }}>Popular near you</div>
        </div>
        <div className="gb-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px 4px' }}>
          {POPULAR.map((it) => <ItemCard key={it.name} item={it} />)}
        </div>
      </div>

      <Categories />
      <CafesNearYou cafes={cafes} cta="View menu" gate />
    </div>
  );
}

function SignedInHome({ cafes, me, topItems, reorderSlug }: { cafes: RealCafe[]; me: Me | null; topItems: TopItem[]; reorderSlug?: string }) {
  const firstName = me?.name?.trim()?.split(' ')[0] || 'there';
  const initial = (me?.name?.trim()?.[0] || me?.phone?.slice(-1) || '?').toUpperCase();
  return (
    <div className="gb-shell gb-shell-wide">
      <div style={heroStyle} className="gb-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>Good morning</div>
            <div className="gb-serif" style={{ fontSize: 29, fontWeight: 500, letterSpacing: '-.01em', marginTop: 3 }}>{firstName}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.16)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>
            {me?.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={me.avatar_url} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initial}
          </div>
        </div>
        <LocationPill />
        <div className="gb-serif" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 20, fontWeight: 400, maxWidth: 270 }}>
          Order ahead. <span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Skip the queue</span>, it&apos;s ready when you are.
        </div>
        <SearchBar />
      </div>

      {/* order again — this customer's most-ordered items, real order history */}
      {topItems.length > 0 && (
        <div style={{ margin: '-34px 16px 0', position: 'relative', zIndex: 2, background: '#fff', borderRadius: 20, padding: '16px 16px 4px', boxShadow: 'var(--gb-shadow-pop)', border: '1px solid var(--gb-line-2)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gb-primary)' }}>Order again</div>
            <Link href="/orders" style={{ fontSize: 12, fontWeight: 700, color: 'var(--gb-muted-2)' }}>All orders</Link>
          </div>
          {topItems.map((it, i) => (
            <Link key={it.menu_item_id} href={reorderSlug ? `/${reorderSlug}` : '/explore'} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: i < topItems.length - 1 ? '1px solid var(--gb-line)' : 'none' }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, overflow: 'hidden', flex: 'none', background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {it.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <MS name="restaurant" size={22} color="var(--gb-primary)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.menu_item_name}</div>
                <div style={{ fontSize: 12, color: 'var(--gb-muted)', marginTop: 2, fontWeight: 600 }}>{inr(it.price)} · ordered {it.total_ordered}×</div>
              </div>
              <div style={{ border: '1.5px solid #E7DCCC', color: 'var(--gb-primary)', fontSize: 13, fontWeight: 800, padding: '9px 15px', borderRadius: 11, flex: 'none' }}>Reorder</div>
            </Link>
          ))}
        </div>
      )}

      <Categories />
      <CafesNearYou cafes={cafes} cta="Pre-order" gate={false} />
      <NavSpacer />
    </div>
  );
}

export default async function HomePage() {
  const [token, cafes] = await Promise.all([
    cookies().then((c) => c.get('grabit_customer_token')?.value),
    getCafes(),
  ]);
  if (!token) return <GuestHome cafes={cafes} />;
  const primaryCafe = cafes[0];
  const [me, topItems] = await Promise.all([
    getMe(token),
    primaryCafe ? getTopItems(token, primaryCafe.id) : Promise.resolve([]),
  ]);
  return <SignedInHome cafes={cafes} me={me} topItems={topItems} reorderSlug={primaryCafe?.slug} />;
}
