'use client';
import Link from 'next/link';
import { RealCafeCard, ComingSoonCafeCard, type RealCafe } from '@/components/gb/cards';
import { useSavedLocation } from '@/components/gb/location';

// City-level proximity: cafés in the detected city sort first. No lat/lng on
// cafés yet (ponytail: upgrade to real distance once the backend has coords).

// Cafés that have confirmed they are joining but have not sent a menu yet, so they
// exist nowhere in the API. Listed as placeholders under the live ones.
//
// An entry here MUST be removed in the same breath as the cafe going live, because
// nothing dedupes the two lists: the API starts returning the cafe and the placeholder
// keeps rendering, so the storefront shows it twice, once orderable and once as
// "Coming soon". The Hims Cafe sat here until it went live on Grabit.
const COMING_SOON: { name: string; area: string; coverUrl?: string }[] = [];

export function CafesNearYou({ cafes, cta }: { cafes: RealCafe[]; cta: string }) {
  const { city } = useSavedLocation();
  const nearby = cafes.filter((c) => c.city?.toLowerCase() === city.toLowerCase());
  const rest = cafes.filter((c) => c.city?.toLowerCase() !== city.toLowerCase());
  const sorted = [...nearby, ...rest];
  const heading = nearby.length > 0 ? `Cafés near you in ${city}` : 'Cafés near you';

  return (
    <div style={{ padding: '22px 20px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500 }}>{heading}</div>
        {sorted.length > 0 && <Link href="/explore" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-primary)' }}>See all</Link>}
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: '16px 0 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>No cafés live near you yet. Check back soon.</div>
      ) : (
        <div className="gb-cafe-grid">
          {sorted.map((c) => <RealCafeCard key={c.slug} cafe={c} cta={cta} />)}
          {COMING_SOON.map((c) => <ComingSoonCafeCard key={c.name} name={c.name} area={c.area} coverUrl={c.coverUrl} />)}
        </div>
      )}
    </div>
  );
}
