'use client';
import { useState } from 'react';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';
import { MS } from '@/components/gb/kit';

export default function CafeListing({ cafes }: { cafes: RealCafe[] }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const filtered = query
    ? cafes.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query),
      )
    : cafes;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 999, padding: '11px 16px', marginTop: 24 }}>
        <MS name="search" size={18} color="var(--gb-muted)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by cafe name or area"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14.5, background: 'transparent', color: 'var(--gb-text)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gb-muted)', fontSize: 14.5 }}>
          {cafes.length === 0 ? 'No cafes are live yet. Check back soon.' : `No cafes match "${q}".`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 4 }}>
          {filtered.map((cafe) => (
            <RealCafeCard key={cafe.id} cafe={cafe} coverHeight={160} />
          ))}
        </div>
      )}
    </>
  );
}
