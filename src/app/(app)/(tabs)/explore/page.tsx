import { MS, NavSpacer } from '@/components/gb/kit';
import { CafeCard } from '@/components/gb/cards';
import { EXPLORE_CATEGORIES, TRENDING, ph } from '@/components/gb/data';

export default function ExplorePage() {
  return (
    <>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph(c.photo)} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 34%,rgba(20,10,5,.62) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontSize: 15, fontWeight: 800 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* trending */}
      <div style={{ padding: '24px 20px 8px' }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Trending this week</div>
        {TRENDING.map((c) => (
          <CafeCard
            key={c.slug}
            cafe={c}
            coverHeight={150}
            badge={{ icon: 'trending_up', iconColor: '#C1502E', text: c.rank }}
          />
        ))}
      </div>
      <NavSpacer />
    </>
  );
}
