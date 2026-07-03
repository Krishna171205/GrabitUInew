'use client';
/** Grabit consumer app — presentational cards shared across Home & Explore. */
import Link from 'next/link';
import { MS, inr } from './kit';
import { ph, type GbCafe, type GbItem, type GbCategory } from './data';
import { useFavoriteCafe } from './favorites';

/* ---------- Café card (cover + info footer) ---------- */
export interface CafeBadge { icon: string; iconColor: string; text: string; }

export function CafeCard({
  cafe, cta = 'View menu', badge, coverHeight = 158,
}: { cafe: GbCafe; cta?: string; badge?: CafeBadge; coverHeight?: number }) {
  const b = badge ?? { icon: 'bolt', iconColor: 'var(--gb-green)', text: `Ready in ${cafe.ready}` };
  const { favorite, toggle } = useFavoriteCafe(cafe.slug);
  return (
    <Link
      href={`/${cafe.slug}`}
      style={{
        display: 'block', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)',
        borderRadius: 22, overflow: 'hidden', marginTop: 16, boxShadow: 'var(--gb-shadow-card)',
      }}
    >
      <div style={{ position: 'relative', height: coverHeight }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph(cafe.cover, 900, 560)} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0) 42%,rgba(20,10,5,.62) 100%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(4px)', padding: '5px 10px', borderRadius: 999 }}>
          <MS name={b.icon} size={15} fill color={b.iconColor} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gb-ink)' }}>{b.text}</span>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
          aria-label={favorite ? 'Remove bookmark' : 'Bookmark'}
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, border: 'none', borderRadius: '50%', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <MS name="bookmark" size={17} fill={favorite} color={favorite ? 'var(--gb-primary)' : 'var(--gb-ink)'} />
        </button>
        <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500, color: '#fff', lineHeight: 1.1 }}>{cafe.name}</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{cafe.tagline}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,.95)', padding: '4px 8px', borderRadius: 8 }}>
            <MS name="star" size={14} fill color="var(--gb-gold)" />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gb-ink)' }}>{cafe.rating}</span>
          </div>
        </div>
      </div>
      {cafe.offer && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px 0', color: 'var(--gb-primary)', fontSize: 12, fontWeight: 700 }}>
          <MS name="local_offer" size={15} fill />{cafe.offer}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', color: '#7A6E60', fontSize: 12.5, fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MS name="near_me" size={16} />{cafe.distance}</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C9BCA9' }} />
        <span>{inr(cafe.forOne)} for one</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gb-primary)', fontWeight: 700 }}>
          {cta}<MS name="arrow_forward" size={17} />
        </span>
      </div>
    </Link>
  );
}

/* ---------- Popular / favourite item card (horizontal carousel) ---------- */
export function ItemCard({ item, heart }: { item: GbItem; heart?: boolean }) {
  return (
    <div style={{ flex: 'none', width: 152, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
      <div style={{ position: 'relative', height: 104 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph(item.photo)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {heart && (
          <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MS name="favorite" size={16} fill color="#C1502E" />
          </div>
        )}
      </div>
      <div style={{ padding: '10px 11px 12px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{item.cafe}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(item.price)}</span>
          <span style={{ width: 26, height: 26, borderRadius: 8, border: '1.5px solid #E7DCCC', color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MS name="add" size={17} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Category circle (Browse by craving) ---------- */
export function CategoryCircle({ cat }: { cat: GbCategory }) {
  return (
    <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 72 }}>
      <div style={{ width: 66, height: 66, borderRadius: 20, overflow: 'hidden', boxShadow: '0 6px 16px -8px rgba(60,40,25,.4)', border: '1px solid #EFE7DB' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph(cat.photo)} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20, display: 'block' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#4A4038', textAlign: 'center', lineHeight: 1.1 }}>{cat.label}</span>
    </div>
  );
}
