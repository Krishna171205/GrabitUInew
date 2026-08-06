'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';
import type { GbCategory } from '@/components/gb/data';

interface DishResult {
  id: number; name: string; price: number; category: string; image_url: string | null;
  cafe_id: number; cafe_name: string; cafe_slug: string;
}

function DishResultCard({ dish }: { dish: DishResult }) {
  return (
    <Link href={`/${dish.cafe_slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 16, padding: 12, marginTop: 10 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, flex: 'none', background: 'linear-gradient(135deg, var(--gb-primary) 0%, #7A2E17 100%)', display: 'grid', placeItems: 'center' }}>
        <span className="gb-serif" style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{dish.name.trim().charAt(0).toUpperCase()}</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dish.name}</div>
        <div style={{ fontSize: 12.5, color: '#7A6E60', fontWeight: 600, marginTop: 2 }}>at {dish.cafe_name}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-primary)', flex: 'none' }}>{inr(dish.price)}</div>
    </Link>
  );
}

export function ExploreSearch({ cafes, categories }: { cafes: RealCafe[]; categories: GbCategory[] }) {
  const [q, setQ] = useState('');
  const [cafeResults, setCafeResults] = useState(cafes);
  const [dishResults, setDishResults] = useState<DishResult[]>([]);
  const query = q.trim();

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '13px 15px', boxShadow: '0 6px 16px -12px rgba(60,40,25,.4)' }}>
        <MS name="search" size={21} color="#B0A08C" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cafés, dishes, cuisines…"
          style={{ flex: 1, fontSize: 14.5, color: 'var(--gb-text)', fontWeight: 500, border: 'none', outline: 'none', background: 'transparent' }}
        />
        <MS name="mic" size={20} color="#C1502E" />
      </div>

      {!query && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={() => setQ(c.query)}
              style={{ position: 'relative', height: 96, borderRadius: 16, overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Image src={c.photo} alt={c.label} fill sizes="(max-width: 768px) 50vw, 320px" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 34%,rgba(20,10,5,.62) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontSize: 15, fontWeight: 800 }}>{c.label}</div>
            </button>
          ))}
        </div>
      )}

      {query && dishResults.length > 0 && (
        <div style={{ padding: '24px 0 0' }}>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Dishes</div>
          {dishResults.map((d) => <DishResultCard key={d.id} dish={d} />)}
        </div>
      )}

      <div style={{ padding: '24px 0 8px' }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
          {query ? 'Cafés' : 'Cafés on Grabbit'}
        </div>
        {cafeResults.length === 0 ? (
          <div style={{ padding: '16px 0 4px', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>
            {query
              ? (dishResults.length > 0 ? 'No cafés directly match — see dishes above.' : 'No cafés or dishes match your search.')
              : 'No cafés live yet. Check back soon.'}
          </div>
        ) : (
          <div className="gb-cafe-grid">
            {cafeResults.map((c) => <RealCafeCard key={c.slug} cafe={c} cta="View menu" coverHeight={150} />)}
          </div>
        )}
      </div>
    </>
  );
}
