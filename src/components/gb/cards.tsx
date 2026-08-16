'use client';
/** Grabbit consumer app, presentational cards shared across Home & Explore. */
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MS } from './kit';
import { inr } from './format';
import { ph, type GbItem, type GbCategory } from './data';
import { fmtTime12, todayHours, type DayHours } from './format';
import { useFavoriteCafe } from './favorites';
import { useCart } from '@/store/cart';

/** A real café from GET /api/grabit/cafes (honest fields only — no rating/distance/ETA). */
export interface RealCafe {
  id: number; name: string; slug: string;
  address?: string | null; city?: string | null;
  opening_time?: string | null; closing_time?: string | null;
  /** Brand mark on the assets CDN. Null for cafes that have not supplied one. */
  logo_url?: string | null;
  /** Storefront photo for the card cover. Null falls back to the branded placeholder. */
  cover_url?: string | null;
  /** Weekly schedule, Monday first. Shown to the customer; it does not decide open/closed. */
  hours?: DayHours[] | null;
  /** Server-fetched Omega store-status, so the card renders correct on first paint (no flash). */
  acceptingOrders?: boolean;
}

/* ---------- Real café card (live data, honest signals only) ---------- */
export function RealCafeCard({ cafe, cta = 'View menu', coverHeight = 132 }: { cafe: RealCafe; cta?: string; coverHeight?: number }) {
  const { favorite, toggle } = useFavoriteCafe(cafe);
  // Omega's store-status toggle, on top of scheduled hours. Seeded server-side (cafe.acceptingOrders)
  // so the card is correct on first paint; only re-fetch client-side if the server didn't know.
  const [acceptingOrders, setAcceptingOrders] = useState(cafe.acceptingOrders !== false);
  useEffect(() => {
    if (cafe.acceptingOrders !== undefined) return;
    fetch(`/api/proxy/grabit/cafes/${cafe.slug}/status`)
      .then(res => res.ok ? res.json() : null)
      .then(d => { if (d) setAcceptingOrders(d.acceptingOrders !== false); })
      .catch(() => {});
  }, [cafe.slug, cafe.acceptingOrders]);
  // Open or closed is the cafe's own toggle in Omega, nothing else. Scheduled hours are
  // information for the customer: staff close early, open late, and the toggle is the
  // only thing that knows. Unknown status stays open (fail-open), as before.
  const open = acceptingOrders;
  const today = todayHours(cafe.hours);
  const hours = today
    ? `${fmtTime12(today.opens)} – ${fmtTime12(today.closes)}`
    : cafe.opening_time && cafe.closing_time ? `${fmtTime12(cafe.opening_time)} – ${fmtTime12(cafe.closing_time)}` : null;
  const initial = cafe.name.trim().charAt(0).toUpperCase();
  const area = cafe.city || cafe.address || null;
  return (
    <Link href={`/${cafe.slug}`} style={{ display: 'block', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-lg)', overflow: 'hidden', marginTop: 16, boxShadow: 'var(--gb-elev-2)' }}>
      {/* The cafe's own storefront photo when it has supplied one. Otherwise the branded
          placeholder: still no stock food photo standing in for a cafe we can't vouch for. */}
      <div style={{ position: 'relative', height: coverHeight, background: 'linear-gradient(135deg, var(--gb-primary) 0%, #7A2E17 100%)', display: 'grid', placeItems: 'center', overflow: 'hidden', filter: open ? 'none' : 'grayscale(1)' }}>
        {cafe.cover_url ? (
          <>
            <Image src={cafe.cover_url} alt="" fill sizes="(max-width: 480px) 100vw, 448px" style={{ objectFit: 'cover' }} />
            {/* The status pill and bookmark sit on top of an unknown photo, so the corners
                they live in get darkened rather than trusting the image to be quiet there. */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,12,6,.42) 0%, rgba(20,12,6,0) 45%)' }} />
          </>
        ) : (
          <span className="gb-serif" style={{ fontSize: 64, fontWeight: 600, color: 'rgba(255,255,255,.22)', lineHeight: 1 }}>{initial}</span>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.94)', padding: '5px 10px', borderRadius: 999 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: open ? 'var(--gb-green)' : 'var(--gb-muted-2)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gb-ink)' }}>{open ? 'Open now' : 'Closed'}</span>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }} aria-label={favorite ? 'Remove bookmark' : 'Bookmark'} style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, border: 'none', borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <MS name="bookmark" size={17} fill={favorite} color={favorite ? 'var(--gb-primary)' : 'var(--gb-ink)'} />
        </button>
      </div>
      <div style={{ padding: '13px 16px' }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--gb-text)', lineHeight: 1.1 }}>{cafe.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, color: '#7A6E60', fontSize: 12.5, fontWeight: 600 }}>
          {area && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}><MS name="near_me" size={15} /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{area}</span></span>}
          {hours && <><span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C9BCA9', flex: 'none' }} /><span style={{ whiteSpace: 'nowrap' }}>{hours}</span></>}
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gb-primary)', fontWeight: 700, flex: 'none' }}>{cta}<MS name="arrow_forward" size={17} /></span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Popular / favourite item card (horizontal carousel) ---------- */
export function ItemCard({ item, heart }: { item: GbItem; heart?: boolean }) {
  const { addItem, items: cartItems } = useCart();
  const inCart = cartItems.some((i) => i.menu_item_id === item.id);

  function add() {
    addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: ph(item.photo) }, item.slug);
  }

  return (
    <div style={{ flex: 'none', width: 152, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-md)', overflow: 'hidden', boxShadow: 'var(--gb-elev-2)' }}>
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
          <button
            onClick={add}
            aria-label="Add"
            style={{ width: 26, height: 26, borderRadius: 'var(--gb-r-xs)', border: '1.5px solid #E7DCCC', background: inCart ? 'var(--gb-primary)' : '#fff', color: inCart ? '#fff' : 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MS name={inCart ? 'check' : 'add'} size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Category circle (Browse by craving) ---------- */
export function CategoryCircle({ cat }: { cat: GbCategory }) {
  return (
    <Link href={`/raydee?craving=${encodeURIComponent(cat.query)}`} style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 72, textDecoration: 'none' }}>
      <div style={{ width: 66, height: 66, borderRadius: 'var(--gb-r-lg)', overflow: 'hidden', boxShadow: 'var(--gb-elev-1)', border: '1px solid #EFE7DB', position: 'relative' }}>
        <Image src={cat.photo} alt={cat.label} fill sizes="66px" style={{ objectFit: 'cover', borderRadius: 'var(--gb-r-lg)' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#4A4038', textAlign: 'center', lineHeight: 1.1 }}>{cat.label}</span>
    </Link>
  );
}
