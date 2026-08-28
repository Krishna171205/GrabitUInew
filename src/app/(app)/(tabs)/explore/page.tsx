import { NavSpacer } from '@/components/gb/kit';
import { type RealCafe } from '@/components/gb/cards';
import { ExploreSearch } from '@/components/gb/ExploreSearch';
import { NearbyCafes } from '@/components/gb/NearbyCafes';

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
        <ExploreSearch cafes={cafes} />
      </div>
      <div style={{ padding: '0 20px' }}>
        <NearbyCafes />
      </div>
      <NavSpacer />
    </div>
  );
}
