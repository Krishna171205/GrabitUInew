import Image from 'next/image';
import { MS, NavSpacer } from '@/components/gb/kit';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';
import { EXPLORE_CATEGORIES } from '@/components/gb/data';

async function getCafes(): Promise<RealCafe[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, { next: { revalidate: 300 } });
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
        <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.01em' }}>Explore</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '13px 15px', boxShadow: '0 6px 16px -12px rgba(60,40,25,.4)' }}>
          <MS name="search" size={21} color="#B0A08C" />
          <span style={{ flex: 1, fontSize: 14.5, color: '#A0917E', fontWeight: 500 }}>Search cafés, dishes, cuisines…</span>
          <MS name="mic" size={20} color="#C1502E" />
        </div>
      </div>

      {/* category tiles */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {EXPLORE_CATEGORIES.map((c) => (
            <div key={c.label} style={{ position: 'relative', height: 96, borderRadius: 16, overflow: 'hidden' }}>
              <Image src={c.photo} alt={c.label} fill sizes="(max-width: 768px) 50vw, 320px" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 34%,rgba(20,10,5,.62) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontSize: 15, fontWeight: 800 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* live cafés — real data, no fabricated trending/rating stats */}
      <div style={{ padding: '24px 20px 8px' }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Cafés on Grabit</div>
        {cafes.length === 0 ? (
          <div style={{ padding: '16px 0 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>No cafés live yet. Check back soon.</div>
        ) : (
          <div className="gb-cafe-grid">
            {cafes.map((c) => <RealCafeCard key={c.slug} cafe={c} cta="View menu" coverHeight={150} />)}
          </div>
        )}
      </div>
      <NavSpacer />
    </div>
  );
}
