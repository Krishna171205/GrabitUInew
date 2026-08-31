'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import { VoiceSearch } from '@/components/gb/VoiceSearch';
import { inr } from '@/components/gb/format';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';
import { menuImageSrc } from '@/lib/menu-image';

interface DishResult {
  id: number; name: string; price: number; category: string; image_url: string | null;
  cafe_id: number; cafe_name: string; cafe_slug: string;
}

function DishResultCard({ dish }: { dish: DishResult }) {
  return (
    <Link href={`/${dish.cafe_slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-md)', padding: 12, marginTop: 10 }}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--gb-r-sm)', flex: 'none', overflow: 'hidden', background: 'var(--gb-surface)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={menuImageSrc(dish.image_url)} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dish.name}</div>
        <div style={{ fontSize: 12.5, color: '#7A6E60', fontWeight: 600, marginTop: 2 }}>at {dish.cafe_name}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-primary)', flex: 'none' }}>{inr(dish.price)}</div>
    </Link>
  );
}

export function ExploreSearch({ cafes }: { cafes: RealCafe[] }) {
  const [q, setQ] = useState('');
  const [cafeResults, setCafeResults] = useState(cafes);
  const [dishResults, setDishResults] = useState<DishResult[]>([]);
  const [nearby, setNearby] = useState<RealCafe[]>([]);
  const query = q.trim();

  // Cafes within 5km of the customer, when the browser will say where that is. A cafe
  // with no pin set can't be measured and never comes back. No fix, no permission or no
  // pins at all just means no section: no skeleton, no error, same as it never existed.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`/api/proxy/grabit/cafes/nearby?lat=${latitude}&lng=${longitude}&radiusKm=5`)
          .then((res) => (res.ok ? res.json() : []))
          .then(setNearby)
          .catch(() => {});
      },
      () => {},
      { timeout: 8000 },
    );
  }, []);

  // Near you comes first, so the full list below is everything else. Showing a cafe in
  // both sections was the same two cards twice on a screen that only has a handful.
  // While searching there is one list of matches and no split: a search is about the
  // query, not about where the customer is standing.
  const nearbyShown = query ? [] : nearby;
  const nearbyIds = new Set(nearbyShown.map((c) => c.id));
  const restResults = cafeResults.filter((c) => !nearbyIds.has(c.id));

  // debounced server search — cafés matched by name/city, dishes matched by name/category
  useEffect(() => {
    if (!query) { setCafeResults(cafes); setDishResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const qs = `q=${encodeURIComponent(query)}`;
      Promise.all([
        fetch(`/api/proxy/grabit/cafes/search?${qs}`, { signal: controller.signal }).then((res) => (res.ok ? res.json() : [])),
        fetch(`/api/proxy/grabit/menu/search?${qs}`, { signal: controller.signal }).then((res) => (res.ok ? res.json() : [])),
      ])
        .then(([cafeRes, dishRes]) => { setCafeResults(cafeRes); setDishResults(dishRes); })
        .catch(() => {});
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, cafes]);

  return (
    <>
      <div className="gb-search-wide" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 'var(--gb-r-sm)', padding: '13px 15px', boxShadow: 'var(--gb-elev-1)' }}>
        <MS name="search" size={21} color="#B0A08C" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cafés, dishes, cuisines…"
          // 16px minimum - iOS Safari auto-zooms on focus for inputs below that.
          style={{ flex: 1, fontSize: 16, color: 'var(--gb-text)', fontWeight: 500, border: 'none', outline: 'none', background: 'transparent' }}
        />
        <VoiceSearch onResult={setQ} />
      </div>

      {query && dishResults.length > 0 && (
        <div style={{ padding: '24px 0 0' }}>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Dishes</div>
          {dishResults.map((d) => <DishResultCard key={d.id} dish={d} />)}
        </div>
      )}

      {nearbyShown.length > 0 && (
        <div style={{ padding: '24px 0 8px' }}>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Cafés near you</div>
          <div className="gb-cafe-grid">
            {nearbyShown.map((c) => <RealCafeCard key={c.slug} cafe={c} cta="View menu" coverHeight={150} />)}
          </div>
        </div>
      )}

      {/* With every cafe already in the section above, a second heading over nothing is
          worse than no heading at all. */}
      {(restResults.length > 0 || nearbyShown.length === 0) && (
        <div style={{ padding: '24px 0 8px' }}>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
            {query ? 'Cafés' : nearbyShown.length > 0 ? 'More cafés on Grabbit' : 'Cafés on Grabbit'}
          </div>
          {restResults.length === 0 ? (
            <div style={{ padding: '16px 0 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>
              {query
                ? (dishResults.length > 0 ? 'No cafés directly match — see dishes above.' : 'No cafés or dishes match your search.')
                : 'No cafés live yet. Check back soon.'}
            </div>
          ) : (
            <div className="gb-cafe-grid">
              {restResults.map((c) => <RealCafeCard key={c.slug} cafe={c} cta="View menu" coverHeight={150} />)}
            </div>
          )}
        </div>
      )}
    </>
  );
}
