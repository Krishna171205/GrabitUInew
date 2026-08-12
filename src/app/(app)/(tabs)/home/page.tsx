import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { MS, NavSpacer } from '@/components/gb/kit';
import { GeneratedAvatar } from '@/components/gb/GeneratedAvatar';
import { greeting } from '@/components/gb/format';
import { ItemCard, CategoryCircle, type RealCafe } from '@/components/gb/cards';
import { LocationPill } from '@/components/gb/LocationPill';
import { CafesNearYou } from '@/components/gb/CafesNearYou';
import { POPULAR, CATEGORIES } from '@/components/gb/data';

// ponytail: feature flag, re-enable when ready
const POPULAR_NEAR_YOU_ENABLED = false;

interface Me { name: string | null; phone: string | null; avatar_url: string | null; }

async function getCafeStatus(slug: string): Promise<boolean | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes/${slug}/status`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    const d = await res.json();
    return d.acceptingOrders !== false;
  } catch { return undefined; }
}

// Real, live cafés — honest data, no fabricated marketplace stats.
async function getCafes(): Promise<RealCafe[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const cafes: RealCafe[] = await res.json();
    // Status is fetched fresh per cafe (not cached with the list) so the "Open now"/"Closed"
    // badge and colour render correct on first paint, no client-side flash after mount.
    const statuses = await Promise.all(cafes.map((c) => getCafeStatus(c.slug)));
    return cafes.map((c, i) => ({ ...c, acceptingOrders: statuses[i] }));
  } catch { return []; }
}

async function getMe(token: string): Promise<Me | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
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
            <div className="gb-serif" style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-.01em', marginTop: 2 }}>Grabbit</div>
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
          <div className="gb-serif" style={{ fontSize: 17, fontWeight: 500 }}>Sign in to unlock your Grabbit</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', marginTop: 2, fontWeight: 600 }}>Reorder, save favourites & track pickups</div>
        </div>
        <Link href="/login" style={{ background: 'var(--gb-ink)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '11px 15px', borderRadius: 12, flex: 'none' }}>Sign in</Link>
      </div>

      {/* popular near you */}
      {POPULAR_NEAR_YOU_ENABLED && (
        <div style={{ padding: '24px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 14px' }}>
            <MS name="local_fire_department" size={20} fill color="#C1502E" />
            <div className="gb-serif" style={{ fontSize: 19, fontWeight: 500 }}>Popular near you</div>
          </div>
          <div className="gb-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 20px 4px' }}>
            {POPULAR.map((it) => <ItemCard key={it.name} item={it} />)}
          </div>
        </div>
      )}

      <Categories />
      <CafesNearYou cafes={cafes} cta="View menu" gate />
    </div>
  );
}

function SignedInHome({ cafes, me }: { cafes: RealCafe[]; me: Me | null }) {
  const firstName = me?.name?.trim()?.split(' ')[0] || 'there';
  const initial = (me?.name?.trim()?.[0] || me?.phone?.slice(-1) || '?').toUpperCase();
  return (
    <div className="gb-shell gb-shell-wide">
      <div style={heroStyle} className="gb-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>{greeting()}</div>
            <div className="gb-serif" style={{ fontSize: 29, fontWeight: 500, letterSpacing: '-.01em', marginTop: 3 }}>{firstName}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.16)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>
            {me?.avatar_url
              ? <Image src={me.avatar_url} alt="You" width={44} height={44} sizes="44px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <GeneratedAvatar seed={me?.name?.trim() || me?.phone || initial} size={44} />}
          </div>
        </div>
        <LocationPill />
        <div className="gb-serif" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 20, fontWeight: 400, maxWidth: 270 }}>
          Order ahead. <span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Skip the queue</span>, it&apos;s ready when you are.
        </div>
        <SearchBar />
      </div>

      <Categories />
      <CafesNearYou cafes={cafes} cta="Pre-order" gate={false} />
      <NavSpacer />
    </div>
  );
}

export default async function HomePage() {
  const [token, cafes] = await Promise.all([
    cookies().then((c) => c.get('grabbit_customer_token')?.value),
    getCafes(),
  ]);
  if (!token) return <GuestHome cafes={cafes} />;
  const me = await getMe(token);
  return <SignedInHome cafes={cafes} me={me} />;
}
