'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GrabitCafe, GrabitMenuItem, GrabitMenuCategory } from '@gradient365/gradient-commons';
import { useCart } from '@/store/cart';
import { MS } from '@/components/gb/kit';
import { inr, cafeOpenNow, fmtTime12 } from '@/components/gb/format';
import { ph } from '@/components/gb/data';

const CATEGORIES: GrabitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];
const CATEGORY_LABELS: Record<GrabitMenuCategory, string> = {
  drinks: 'Drinks', food: 'Food', specials: 'Specials', desserts: 'Desserts',
};
// No per-item photos in the backend yet: one honest placeholder per category
// (not a random cycle) so a coffee never shows a croissant. ponytail: swap
// for real item.image_url once cafés upload photos.
const CATEGORY_PLACEHOLDER: Record<GrabitMenuCategory, string> = {
  drinks: 'photo-1461023058943-07fcbe16d735',
  food: 'photo-1525351484163-7529414344d8',
  specials: 'photo-1495474472287-4d71bcdd2085',
  desserts: 'photo-1488477181946-6428a0291777',
};
const HOT_DRINK_PLACEHOLDER = 'photo-1541167760496-1628856ab772';

function placeholderFor(item: GrabitMenuItem) {
  if (item.category === 'drinks' && /\bhot\b/i.test(item.name) && !/iced|cold/i.test(item.name)) {
    return HOT_DRINK_PLACEHOLDER;
  }
  return CATEGORY_PLACEHOLDER[item.category];
}

interface TopItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
  total_ordered: number;
}

interface FavItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
}

interface Props {
  slug: string;
  cafe: GrabitCafe;
  items: GrabitMenuItem[];
  customerName?: string | null;
  topItems?: TopItem[];
  favorites?: FavItem[];
  isLoggedIn?: boolean;
  table?: string | null;
}

/* veg mark (square outline + dot) — only rendered when veg status is known */
function Veg({ veg }: { veg?: boolean | null }) {
  if (veg == null) return null;
  const c = veg ? '#3E8E4E' : '#9E2A2B';
  return (
    <span style={{ width: 14, height: 14, border: `1.5px solid ${c}`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
    </span>
  );
}

export default function MenuClient({ slug, cafe, items, customerName, topItems = [], favorites = [], isLoggedIn = false, table = null }: Props) {
  const [favIds, setFavIds] = useState<Set<number>>(new Set(favorites.map(f => f.menu_item_id)));

  async function toggleFavorite(menuItemId: number) {
    const wasFav = favIds.has(menuItemId);
    setFavIds(prev => {
      const next = new Set(prev);
      wasFav ? next.delete(menuItemId) : next.add(menuItemId);
      return next;
    });
    try {
      await fetch('/api/proxy/grabit/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId: cafe.id, menuItemId }),
      });
    } catch {
      setFavIds(prev => {
        const next = new Set(prev);
        wasFav ? next.add(menuItemId) : next.delete(menuItemId);
        return next;
      });
    }
  }
  const router = useRouter();

  // Dine-in QR entry (/{slug}?table=N): remember the table for this session so cart/checkout become
  // dine-in (no pickup slot); a plain visit (no ?table) clears it back to pickup.
  useEffect(() => {
    if (table) sessionStorage.setItem('grabit_table', table);
    else sessionStorage.removeItem('grabit_table');
  }, [table]);
  const [activeCat, setActiveCat] = useState<GrabitMenuCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const { addItem, updateQty, items: cartItems, total } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const qtyOf = (id: number) => cartItems.find(i => i.menu_item_id === id)?.quantity ?? 0;

  function addTop(item: TopItem) {
    addItem({ menu_item_id: item.menu_item_id, name: item.menu_item_name, price: item.price, quantity: 1, image_url: item.image_url }, slug);
  }

  const favoriteItems = items.filter(i => favIds.has(i.id));

  useEffect(() => {
    if (cafe?.id) sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(cafe.id));
  }, [slug, cafe?.id]);

  const q = query.trim().toLowerCase();
  const available = items.filter(i => i.is_available && (!q || i.name.toLowerCase().includes(q)));
  const categoriesPresent = CATEGORIES.filter(c => available.some(i => i.category === c));
  const shownCats = activeCat === 'all' ? categoriesPresent : categoriesPresent.filter(c => c === activeCat);
  const cover = cafe.image_url || ph('photo-1495474472287-4d71bcdd2085', 900, 560);

  // Real signals only — no fabricated ratings/distance (GrabitCafe has no such fields).
  const hasHours = Boolean(cafe.opening_time && cafe.closing_time);
  const open = cafeOpenNow(cafe.opening_time, cafe.closing_time);
  const hours = hasHours ? `${fmtTime12(cafe.opening_time)} – ${fmtTime12(cafe.closing_time)}` : 'Hours vary';

  const chip = (active: boolean) => ({
    flex: 'none' as const, display: 'inline-flex', alignItems: 'center', gap: 5,
    border: `1px solid ${active ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`,
    background: active ? 'var(--gb-ink)' : '#fff', color: active ? '#fff' : '#5A4E42',
    fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
  });

  const addStep = (item: GrabitMenuItem) => {
    const qty = qtyOf(item.id);
    if (qty > 0) {
      return (
        <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 11, boxShadow: '0 6px 14px -6px rgba(60,40,25,.5)', overflow: 'hidden' }}>
          <button onClick={() => updateQty(item.id, qty - 1)} style={{ width: 32, height: 34, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={20} /></button>
          <span style={{ minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: 800, color: 'var(--gb-primary)' }}>{qty}</span>
          <button onClick={() => updateQty(item.id, qty + 1)} style={{ width: 32, height: 34, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={20} /></button>
        </div>
      );
    }
    return (
      <button
        onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url, is_veg: item.is_veg }, slug)}
        style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: '1.5px solid #E7DCCC', borderRadius: 11, boxShadow: '0 6px 14px -6px rgba(60,40,25,.4)', padding: '8px 18px', color: 'var(--gb-primary)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
      >
        Add<MS name="add" size={16} />
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: cartCount > 0 ? 110 : 24 }}>
      {/* cover */}
      <div style={{ position: 'relative', height: 250 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(20,12,6,.5) 0%,rgba(20,12,6,0) 34%,rgba(20,12,6,.35) 74%,rgba(20,12,6,.7) 100%)' }} />
        <button onClick={() => router.push('/home')} aria-label="Back" style={{ position: 'absolute', top: 'calc(14px + env(safe-area-inset-top))', left: 18, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <MS name="arrow_back" size={22} color="var(--gb-ink)" />
        </button>
        <div style={{ position: 'absolute', bottom: 18, left: 20, right: 20, color: '#fff' }}>
          <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.05 }}>{cafe.name}</div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,.85)', marginTop: 4 }}>Order ahead · Skip the queue</div>
        </div>
      </div>

      {/* info strip — real signals only */}
      <div style={{ background: '#fff', margin: '-14px 16px 0', position: 'relative', borderRadius: 18, border: '1px solid var(--gb-line-2)', boxShadow: '0 12px 26px -18px rgba(60,40,25,.4)', display: 'flex', padding: '14px 6px' }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--gb-line-2)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14.5, fontWeight: 800, color: open ? 'var(--gb-green)' : 'var(--gb-muted-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: open ? 'var(--gb-green)' : 'var(--gb-muted-2)', flex: 'none' }} />{open ? 'Open now' : 'Closed'}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>{hours}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', ...(cafe.city ? { borderRight: '1px solid var(--gb-line-2)' } : {}) }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--gb-ink)' }}>Order ahead</div>
          <div style={{ fontSize: 10.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>skip the queue</div>
        </div>
        {cafe.city && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--gb-ink)' }}>{cafe.city}</div>
            <div style={{ fontSize: 10.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>pickup</div>
          </div>
        )}
      </div>

      {/* login nudge (guest) */}
      {!isLoggedIn && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--gb-primary-soft)', border: '1px solid #EAD6C4', borderRadius: 16, padding: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--gb-primary)', flex: 'none' }}>
              <MS name="schedule" size={24} color="var(--gb-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-primary)' }}>Skip the queue</div>
              <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', marginTop: 1 }}>Order now, pick a 15-min slot, walk past the line.</div>
            </div>
            <Link href={`/login?next=/${slug}`} style={{ color: 'var(--gb-primary)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>Log in →</Link>
          </div>
        </div>
      )}

      {/* greeting + your usuals (returning users) */}
      {isLoggedIn && customerName && (
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-primary)' }}>Welcome back</div>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>Hey {customerName}, the usual?</div>
        </div>
      )}
      {isLoggedIn && topItems.length > 0 && (
        <div style={{ padding: '14px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span className="gb-serif" style={{ fontSize: 16, fontWeight: 500 }}>Your usuals</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--gb-primary)' }}>Tap to re-add</span>
          </div>
          <div className="gb-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }}>
            {topItems.map(item => (
              <div key={item.menu_item_id} style={{ flex: 'none', width: 132, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 96 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url || ph('photo-1541167760496-1628856ab772')} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {qtyOf(item.menu_item_id) > 0 ? (
                    <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 999, boxShadow: '0 3px 10px rgba(60,40,25,.25)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.menu_item_id, qtyOf(item.menu_item_id) - 1)} aria-label="Remove one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
                      <span style={{ minWidth: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qtyOf(item.menu_item_id)}</span>
                      <button onClick={() => updateQty(item.menu_item_id, qtyOf(item.menu_item_id) + 1)} aria-label="Add one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => addTop(item)} aria-label="Add" style={{ position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}>
                      <MS name="add" size={17} />
                    </button>
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.menu_item_name}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gb-text)', marginTop: 4 }}>{inr(item.price)}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--gb-muted-2)', marginTop: 2 }}>Ordered {item.total_ordered}×</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isLoggedIn && favoriteItems.length > 0 && (
        <div style={{ padding: '14px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span className="gb-serif" style={{ fontSize: 16, fontWeight: 500 }}>Your favourites</span>
          </div>
          <div className="gb-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }}>
            {favoriteItems.map(item => (
              <div key={item.id} style={{ flex: 'none', width: 132, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 96 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url || ph('photo-1541167760496-1628856ab772')} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {qtyOf(item.id) > 0 ? (
                    <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 999, boxShadow: '0 3px 10px rgba(60,40,25,.25)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.id, qtyOf(item.id) - 1)} aria-label="Remove one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
                      <span style={{ minWidth: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qtyOf(item.id)}</span>
                      <button onClick={() => updateQty(item.id, qtyOf(item.id) + 1)} aria-label="Add one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }, slug)} aria-label="Add" style={{ position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}>
                      <MS name="add" size={17} />
                    </button>
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gb-text)', marginTop: 4 }}>{inr(item.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* menu search */}
      <div style={{ padding: '18px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '12px 14px', boxShadow: '0 6px 16px -12px rgba(60,40,25,.4)' }}>
          <MS name="search" size={20} color="#B0A08C" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this menu, flat white, croissant…" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)', fontWeight: 500 }} />
          <MS name="mic" size={20} color="#C1502E" />
        </div>
      </div>

      {/* filter chips — sticky so switching category is always one tap away */}
      <div className="gb-scroll" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--gb-surface)', boxShadow: '0 6px 10px -8px rgba(60,40,25,.35)', display: 'flex', gap: 9, overflowX: 'auto', padding: '14px 16px 10px' }}>
        <div style={chip(false)}><MS name="tune" size={17} color="var(--gb-primary)" />Filters</div>
        <button style={chip(activeCat === 'all')} onClick={() => setActiveCat('all')}>All</button>
        {categoriesPresent.map(c => (
          <button key={c} style={chip(activeCat === c)} onClick={() => setActiveCat(c)}>{CATEGORY_LABELS[c]}</button>
        ))}
      </div>

      {/* menu */}
      <div style={{ padding: '6px 16px 0' }}>
        {shownCats.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--gb-muted)', fontSize: 14, padding: '48px 0', fontWeight: 500 }}>No items match your search</p>
        )}
        {shownCats.map(cat => {
          const catItems = available.filter(i => i.category === cat);
          if (!catItems.length) return null;
          return (
            <div key={cat}>
              <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, margin: '20px 4px 8px', color: '#3A302A' }}>{CATEGORY_LABELS[cat]}</div>
              {catItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: '15px 0', borderBottom: '1px solid var(--gb-line)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Veg veg={item.is_veg} /><span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gb-text)' }}>{item.name}</span></div>
                    {item.description && <div style={{ fontSize: 13, color: 'var(--gb-muted)', lineHeight: 1.4, marginTop: 5, fontWeight: 500 }}>{item.description}</div>}
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gb-text)', marginTop: 8 }}>{inr(item.price)}</div>
                  </div>
                  <div style={{ width: 104, flex: 'none', position: 'relative' }}>
                    <div style={{ width: 104, height: 96, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 18px -10px rgba(60,40,25,.4)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url || ph(placeholderFor(item))} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    {isLoggedIn && (
                      <button onClick={() => toggleFavorite(item.id)} aria-label={favIds.has(item.id) ? 'Remove favourite' : 'Add favourite'} style={{ position: 'absolute', left: 6, top: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(60,40,25,.25)' }}>
                        <MS name={favIds.has(item.id) ? 'favorite' : 'favorite_border'} size={15} color={favIds.has(item.id) ? '#C0392B' : 'var(--gb-muted-2)'} />
                      </button>
                    )}
                    {addStep(item)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* floating cart bar */}
      {cartCount > 0 && (
        <Link href={`/${slug}/cart`} style={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', left: 16, right: 16, maxWidth: 448, margin: '0 auto', zIndex: 35, background: 'var(--gb-ink)', color: '#fff', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--gb-shadow-bar)' }}>
          <span style={{ background: 'rgba(255,255,255,.16)', borderRadius: 9, padding: '6px 9px', fontSize: 13, fontWeight: 800 }}>{cartCount}</span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>View cart · {inr(total())}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 14, fontWeight: 700, color: 'var(--gb-peach)' }}>Next<MS name="arrow_forward" size={19} /></span>
        </Link>
      )}
    </div>
  );
}
