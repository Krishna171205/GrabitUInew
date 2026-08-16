'use client';
/** Everything the customer has saved: menu items across cafés, and saved cafés. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MS, TopBar, Eyebrow, NavSpacer } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import { RealCafeCard, type RealCafe } from '@/components/gb/cards';

interface FavItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
  cafe_id: number;
  cafe_name: string;
  cafe_slug: string;
}

function ItemRow({ item }: { item: FavItem }) {
  return (
    <Link href={`/${item.cafe_slug}`} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 18px', borderBottom: '1px solid var(--gb-line)' }}>
      <div style={{ width: 54, height: 54, borderRadius: 14, overflow: 'hidden', flex: 'none', background: 'var(--gb-surface)', display: 'grid', placeItems: 'center' }}>
        {item.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.image_url} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <MS name="local_cafe" size={22} color="var(--gb-muted-2)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.menu_item_name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>{item.cafe_name}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gb-text)', flex: 'none' }}>{inr(item.price)}</div>
      <MS name="chevron_right" size={20} color="var(--gb-icon)" />
    </Link>
  );
}

export default function FavouritesPage() {
  const [items, setItems] = useState<FavItem[]>([]);
  const [cafes, setCafes] = useState<RealCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    fetch('/api/proxy/grabit/favorites/mine')
      .then((r) => {
        if (r.status === 401) { setSignedOut(true); return null; }
        return r.ok ? r.json() : null;
      })
      .then((data: { items: FavItem[]; cafes: RealCafe[] } | null) => {
        if (!data) return;
        setItems(data.items ?? []);
        setCafes(data.cafes ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const empty = !loading && !signedOut && items.length === 0 && cafes.length === 0;

  return (
    <div className="gb-shell">
      <TopBar title="Favourites" />

      {loading && (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>Loading…</div>
      )}

      {signedOut && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <MS name="favorite" size={40} color="var(--gb-line-3)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', marginTop: 10 }}>Log in to see your favourites</div>
          <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 4 }}>Your saved dishes and cafés live with your account.</div>
          <Link href="/login" style={{ display: 'inline-block', marginTop: 16, background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '11px 22px', borderRadius: 12 }}>Log in</Link>
        </div>
      )}

      {empty && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <MS name="favorite_border" size={40} color="var(--gb-line-3)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', marginTop: 10 }}>Nothing saved yet</div>
          <div style={{ fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 4 }}>Tap the heart on a dish, or the bookmark on a café, to save it here.</div>
          <Link href="/explore" style={{ display: 'inline-block', marginTop: 16, background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '11px 22px', borderRadius: 12 }}>Browse cafés</Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <Eyebrow style={{ padding: '16px 20px 6px' }}>Saved dishes</Eyebrow>
          {items.map((i) => <ItemRow key={i.menu_item_id} item={i} />)}
        </>
      )}

      {cafes.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <Eyebrow style={{ padding: '20px 4px 0' }}>Saved cafés</Eyebrow>
          {cafes.map((c) => <RealCafeCard key={c.slug} cafe={c} cta="View menu" />)}
        </div>
      )}

      <NavSpacer />
    </div>
  );
}
