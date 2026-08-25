'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { GrabbitCafe, GrabbitMenuItem, GrabbitMenuCategory, GrabbitMenuAddon } from '@gradient365/gradient-commons';
import { useCart, cartLineKey } from '@/store/cart';
import { MS } from '@/components/gb/kit';
import { VoiceSearch } from '@/components/gb/VoiceSearch';
import { inr, cafeOpenNow, fmtTime12 } from '@/components/gb/format';
import { ph } from '@/components/gb/data';

const CATEGORIES: GrabbitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];
const CATEGORY_LABELS: Record<GrabbitMenuCategory, string> = {
  drinks: 'Drinks', food: 'Food', specials: 'Specials', desserts: 'Desserts',
};

// Sort modes for the menu list (Zomato-style). Only real signals — price is the
// one universal field; ratings/popularity aren't in the backend yet.
const SORT_MODES = [
  { id: 'recommended', label: 'Recommended', icon: 'auto_awesome' },
  { id: 'price_asc', label: 'Price: Low to High', icon: 'north' },
  { id: 'price_desc', label: 'Price: High to Low', icon: 'south' },
  { id: 'name_az', label: 'Name: A to Z', icon: 'sort_by_alpha' },
] as const;
type SortModeId = typeof SORT_MODES[number]['id'];
// No per-item photos in the backend yet: one honest placeholder per category
// (not a random cycle) so a coffee never shows a croissant. ponytail: swap
// for real item.image_url once cafés upload photos.
const CATEGORY_PLACEHOLDER: Record<GrabbitMenuCategory, string> = {
  drinks: 'photo-1461023058943-07fcbe16d735',
  food: 'photo-1525351484163-7529414344d8',
  specials: 'photo-1495474472287-4d71bcdd2085',
  desserts: 'photo-1488477181946-6428a0291777',
};
const HOT_DRINK_PLACEHOLDER = 'photo-1541167760496-1628856ab772';

function placeholderFor(item: GrabbitMenuItem) {
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
  cafe: GrabbitCafe;
  items: GrabbitMenuItem[];
  addons: GrabbitMenuAddon[];
  customerName?: string | null;
  topItems?: TopItem[];
  favorites?: FavItem[];
  isLoggedIn?: boolean;
  table?: string | null;
  initialQuery?: string | null;
  initialAcceptingOrders?: boolean;
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

export default function MenuClient({ slug, cafe, items, addons, customerName, topItems = [], favorites = [], isLoggedIn = false, table = null, initialQuery = null, initialAcceptingOrders }: Props) {
  const [favIds, setFavIds] = useState<Set<number>>(new Set(favorites.map(f => f.menu_item_id)));

  // Omega's store-status toggle, on top of the scheduled hours below. Seeded server-side
  // (initialAcceptingOrders) so the page renders open/closed correct on first paint; only
  // re-fetch client-side if the server didn't know. Defaults true (fail-open) otherwise.
  const [acceptingOrders, setAcceptingOrders] = useState(initialAcceptingOrders !== false);
  useEffect(() => {
    if (initialAcceptingOrders !== undefined) return;
    fetch(`/api/proxy/grabit/cafes/${slug}/status`)
      .then(res => res.ok ? res.json() : null)
      .then(d => { if (d) setAcceptingOrders(d.acceptingOrders !== false); })
      .catch(() => {});
  }, [slug, initialAcceptingOrders]);

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
    if (table) sessionStorage.setItem('grabbit_table', table);
    else sessionStorage.removeItem('grabbit_table');
  }, [table]);
  const [activeCat, setActiveCat] = useState<GrabbitMenuCategory | 'all'>('all');
  const [activeSub, setActiveSub] = useState<string>('all');
  const [showSubSheet, setShowSubSheet] = useState(false);
  const VISIBLE_SUBS = 3;
  const [sortMode, setSortMode] = useState<SortModeId>('recommended');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [query, setQuery] = useState(initialQuery ?? '');
  const [addonSheetItem, setAddonSheetItem] = useState<GrabbitMenuItem | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
  const { addItem, updateQty, clearCart, items: cartItems, total } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  // Inline steppers (menu grid + carousels) have no addon context, so they only ever
  // adjust the plain (no-addon) line. Addon-variant quantities are adjusted on the cart page.
  const plainLineKey = (id: number) => cartLineKey({ menu_item_id: id, addons: undefined });
  // Scoped to that same plain line: counting addon variants here showed a stepper whose
  // -/+ couldn't move it (cart holds only "burger + cheese"), and whose "-" deleted the
  // whole untouched plain line when both existed.
  const qtyOf = (id: number) => cartItems.find(i => cartLineKey(i) === plainLineKey(id))?.quantity ?? 0;

  // Closed cafe: block adding, shake the tapped button, show a self-dismissing toast.
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [closedToast, setClosedToast] = useState(false);
  function guardedAdd(id: number, fn: () => void) {
    if (!open) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 500);
      setClosedToast(true);
      setTimeout(() => setClosedToast(false), 3000);
      return;
    }
    fn();
  }

  // topItems/favorites are stale snapshots (order history, favorite toggles) that can
  // outlive the item being pulled off the menu or repriced — cross-check against the
  // live menu (`items`) before letting either carousel add to cart.
  const itemById = new Map(items.map(i => [i.id, i]));
  const liveTopItems = topItems.filter(t => itemById.get(t.menu_item_id)?.is_available);

  const addonsBySubcategory = new Map<number, GrabbitMenuAddon[]>();
  for (const a of addons) {
    if (!a.is_available) continue;
    const list = addonsBySubcategory.get(a.subcategory_id) ?? [];
    list.push(a);
    addonsBySubcategory.set(a.subcategory_id, list);
  }
  function addonsFor(item: GrabbitMenuItem): GrabbitMenuAddon[] {
    return item.subcategory_id ? (addonsBySubcategory.get(item.subcategory_id) ?? []) : [];
  }

  function addTop(item: TopItem) {
    const live = itemById.get(item.menu_item_id);
    if (!live?.is_available) return;
    addItem({ menu_item_id: item.menu_item_id, name: live.name, price: live.price, quantity: 1, image_url: item.image_url }, slug);
  }

  const favoriteItems = items.filter(i => favIds.has(i.id) && i.is_available);

  useEffect(() => {
    if (cafe?.id) sessionStorage.setItem(`grabbit_cafe_id_${slug}`, String(cafe.id));
  }, [slug, cafe?.id]);

  const q = query.trim().toLowerCase();
  const available = items.filter(i => i.is_available && (!q || i.name.toLowerCase().includes(q)));
  // Sort applies within the current category/subcategory view — Recommended keeps the
  // cafe's own menu order (sort_order from the backend).
  function sorted(list: GrabbitMenuItem[]): GrabbitMenuItem[] {
    if (sortMode === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortMode === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortMode === 'name_az') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list; // recommended: keep backend order
  }
  const categoriesPresent = CATEGORIES.filter(c => available.some(i => i.category === c));
  const shownCats = activeCat === 'all' ? categoriesPresent : categoriesPresent.filter(c => c === activeCat);
  // Subcategories are scoped to the selected category (or all categories, when none picked yet).
  const subsPresent = Array.from(new Set(
    available
      .filter(i => activeCat === 'all' || i.category === activeCat)
      .map(i => i.subcategory_name)
      .filter((s): s is string => !!s)
  ));
  const cover = cafe.image_url || ph('photo-1495474472287-4d71bcdd2085', 900, 560);

  // Real signals only — no fabricated ratings/distance (GrabbitCafe has no such fields).
  const hasHours = Boolean(cafe.opening_time && cafe.closing_time);
  const open = cafeOpenNow(cafe.opening_time, cafe.closing_time) && acceptingOrders;
  const hours = hasHours ? `${fmtTime12(cafe.opening_time)} – ${fmtTime12(cafe.closing_time)}` : 'Hours vary';

  const chip = (active: boolean) => ({
    flex: 'none' as const, display: 'inline-flex', alignItems: 'center', gap: 5,
    border: `1px solid ${active ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`,
    background: active ? 'var(--gb-ink)' : '#fff', color: active ? '#fff' : '#5A4E42',
    fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
  });

  function handleAddClick(item: GrabbitMenuItem) {
    const available = addonsFor(item);
    if (available.length === 0) {
      addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url, is_veg: item.is_veg }, slug);
      return;
    }
    setSelectedAddonIds(new Set());
    setAddonSheetItem(item);
  }

  function confirmAddonSheet() {
    if (!addonSheetItem) return;
    const chosen = addonsFor(addonSheetItem).filter(a => selectedAddonIds.has(a.id));
    addItem({
      menu_item_id: addonSheetItem.id,
      name: addonSheetItem.name,
      price: addonSheetItem.price,
      quantity: 1,
      image_url: addonSheetItem.image_url,
      is_veg: addonSheetItem.is_veg,
      addons: chosen.map(a => ({ id: a.id, name: a.name, price: a.price })),
    }, slug);
    setAddonSheetItem(null);
  }

  const addStep = (item: GrabbitMenuItem) => {
    const qty = qtyOf(item.id);
    if (qty > 0) {
      return (
        <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 11, boxShadow: '0 6px 14px -6px rgba(15, 23, 42,.5)', overflow: 'hidden' }}>
          <button onClick={() => updateQty(plainLineKey(item.id), qty - 1)} style={{ width: 32, height: 34, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={20} /></button>
          <span style={{ minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: 800, color: 'var(--gb-primary)' }}>{qty}</span>
          <button onClick={() => guardedAdd(item.id, () => updateQty(plainLineKey(item.id), qty + 1))} className={shakeId === item.id ? 'gb-shake' : undefined} style={{ width: 32, height: 34, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={20} /></button>
        </div>
      );
    }
    return (
      <button
        onClick={() => guardedAdd(item.id, () => handleAddClick(item))}
        className={shakeId === item.id ? 'gb-shake' : undefined}
        style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: '1.5px solid #E7DCCC', borderRadius: 11, boxShadow: '0 6px 14px -6px rgba(15, 23, 42,.4)', padding: '8px 18px', color: 'var(--gb-primary)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
      >
        Add<MS name="add" size={16} />
      </button>
    );
  };

  // Grid-card variant (image-top layout): pinned bottom-right of the card's text
  // block instead of overlapping the image, since the card has no fixed-height
  // image box to float over like the horizontal carousels do.
  const gridAddStep = (item: GrabbitMenuItem) => {
    const qty = qtyOf(item.id);
    if (qty > 0) {
      return (
        <div style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 10, boxShadow: '0 4px 10px -4px rgba(60,40,25,.4)', overflow: 'hidden' }}>
          <button onClick={() => updateQty(plainLineKey(item.id), qty - 1)} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
          <span style={{ minWidth: 16, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qty}</span>
          <button onClick={() => guardedAdd(item.id, () => updateQty(plainLineKey(item.id), qty + 1))} className={shakeId === item.id ? 'gb-shake' : undefined} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
        </div>
      );
    }
    return (
      <button
        onClick={() => guardedAdd(item.id, () => handleAddClick(item))}
        className={shakeId === item.id ? 'gb-shake' : undefined}
        style={{ position: 'absolute', right: 10, bottom: 10, background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 9, padding: '6px 16px', color: 'var(--gb-primary)', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px -4px rgba(60,40,25,.4)' }}
      >
        Add
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: cartCount > 0 ? 110 : 24 }}>
      {closedToast && (
        <div style={{ position: 'fixed', top: 'calc(16px + env(safe-area-inset-top))', left: 16, right: 16, maxWidth: 448, margin: '0 auto', zIndex: 60, background: 'var(--gb-ink)', color: '#fff', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, boxShadow: 'var(--gb-shadow-bar)', animation: 'fade-in .2s ease' }}>
          <MS name="storefront" size={18} color="#fff" />
          This cafe is closed now, please try again later
        </div>
      )}
      {/* CSS filter greys a subtree, not individual children, so ordering is split into two
          filtered blocks around the login nudge below — that stays full colour even when
          closed, since logging in to see past orders/profile doesn't need the cafe to be open. */}
      <div style={{ filter: open ? 'none' : 'grayscale(1)' }}>
      {/* cover */}
      <div style={{ position: 'relative', height: 250 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image src={cover} alt={cafe.name} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
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
      <div style={{ background: '#fff', margin: '-14px 16px 0', position: 'relative', borderRadius: 18, border: '1px solid var(--gb-line-2)', boxShadow: '0 12px 26px -18px rgba(15, 23, 42,.4)', display: 'flex', padding: '14px 6px' }}>
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
      </div>

      {/* login nudge (guest) — full colour even when closed: logging in to see past
          orders/profile doesn't need the cafe to be open. */}
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

      <div style={{ filter: open ? 'none' : 'grayscale(1)' }}>
      {/* greeting + your usuals (returning users) */}
      {isLoggedIn && customerName && (
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-primary)' }}>Welcome back</div>
          <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>Hey {customerName}, the usual?</div>
        </div>
      )}
      {isLoggedIn && liveTopItems.length > 0 && (
        <div style={{ padding: '14px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span className="gb-serif" style={{ fontSize: 16, fontWeight: 500 }}>Your usuals</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--gb-primary)' }}>Tap to re-add</span>
          </div>
          <div className="gb-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }}>
            {liveTopItems.map(item => (
              <div key={item.menu_item_id} style={{ flex: 'none', width: 132, background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--gb-shadow-soft)' }}>
                <div style={{ position: 'relative', height: 96 }}>
                  <Image src={item.image_url || ph('photo-1541167760496-1628856ab772')} alt={item.menu_item_name} fill sizes="132px" style={{ objectFit: 'cover' }} />
                  {qtyOf(item.menu_item_id) > 0 ? (
                    <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 999, boxShadow: '0 3px 10px rgba(15, 23, 42,.25)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(plainLineKey(item.menu_item_id), qtyOf(item.menu_item_id) - 1)} aria-label="Remove one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
                      <span style={{ minWidth: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qtyOf(item.menu_item_id)}</span>
                      <button onClick={() => guardedAdd(item.menu_item_id, () => updateQty(plainLineKey(item.menu_item_id), qtyOf(item.menu_item_id) + 1))} aria-label="Add one" className={shakeId === item.menu_item_id ? 'gb-shake' : undefined} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => guardedAdd(item.menu_item_id, () => addTop(item))} aria-label="Add" className={shakeId === item.menu_item_id ? 'gb-shake' : undefined} style={{ position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}>
                      <MS name="add" size={17} />
                    </button>
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.menu_item_name}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gb-text)', marginTop: 4 }}>{inr(itemById.get(item.menu_item_id)!.price)}</div>
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
                  <Image src={item.image_url || ph('photo-1541167760496-1628856ab772')} alt={item.name} fill sizes="132px" style={{ objectFit: 'cover' }} />
                  <button onClick={() => toggleFavorite(item.id)} aria-label="Remove favourite" style={{ position: 'absolute', left: 6, top: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(60,40,25,.25)' }}>
                    <MS name="favorite" size={15} fill color="#C0392B" />
                  </button>
                  {qtyOf(item.id) > 0 ? (
                    <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 999, boxShadow: '0 3px 10px rgba(15, 23, 42,.25)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(plainLineKey(item.id), qtyOf(item.id) - 1)} aria-label="Remove one" style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="remove" size={16} /></button>
                      <span style={{ minWidth: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gb-primary)' }}>{qtyOf(item.id)}</span>
                      <button onClick={() => guardedAdd(item.id, () => updateQty(plainLineKey(item.id), qtyOf(item.id) + 1))} aria-label="Add one" className={shakeId === item.id ? 'gb-shake' : undefined} style={{ width: 26, height: 28, color: 'var(--gb-primary)', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}><MS name="add" size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => guardedAdd(item.id, () => handleAddClick(item))} aria-label="Add" className={shakeId === item.id ? 'gb-shake' : undefined} style={{ position: 'absolute', right: 8, bottom: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,177,0,.45)' }}>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #ECE2D4', borderRadius: 14, padding: '12px 14px', boxShadow: '0 6px 16px -12px rgba(15, 23, 42,.4)' }}>
          <MS name="search" size={20} color="#B0A08C" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this menu, flat white, croissant…" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 16, color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)', fontWeight: 500 }} />
          {query
            ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search" style={{ display: 'flex', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}><MS name="close" size={20} color="#B0A08C" /></button>
            : <VoiceSearch onResult={setQuery} />}
        </div>
      </div>

      {/* filter chips — sticky so switching category/subcategory is always one tap away.
          Subcategories share the same row as categories (Zomato-style), with a "+More"
          chip opening a sheet once there are more than fit on one line. */}
      <div className="gb-scroll" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--gb-surface)', boxShadow: '0 6px 10px -8px rgba(15, 23, 42,.35)', display: 'flex', alignItems: 'center', gap: 9, overflowX: 'auto', padding: '14px 16px' }}>
        <button style={chip(sortMode !== 'recommended')} onClick={() => setShowSortSheet(true)} aria-label="Sort and filter menu">
          <MS name="tune" size={17} color={sortMode !== 'recommended' ? '#fff' : 'var(--gb-primary)'} />Filters
        </button>
        <button style={chip(activeCat === 'all')} onClick={() => { setActiveCat('all'); setActiveSub('all'); }}>All</button>
        {categoriesPresent.map(c => (
          <button key={c} style={chip(activeCat === c)} onClick={() => { setActiveCat(c); setActiveSub('all'); }}>{CATEGORY_LABELS[c]}</button>
        ))}
        {subsPresent.length > 0 && (
          <>
            <span style={{ width: 1, height: 22, background: 'var(--gb-line-3)', flex: 'none' }} />
            {activeSub !== 'all' && (
              <button style={chip(true)} onClick={() => setActiveSub('all')}>{activeSub}<MS name="close" size={15} /></button>
            )}
            {subsPresent.filter(s => s !== activeSub).slice(0, VISIBLE_SUBS).map(s => (
              <button key={s} style={chip(false)} onClick={() => setActiveSub(s)}>{s}</button>
            ))}
            {subsPresent.filter(s => s !== activeSub).length > VISIBLE_SUBS && (
              <button style={chip(false)} onClick={() => setShowSubSheet(true)}>
                +{subsPresent.filter(s => s !== activeSub).length - VISIBLE_SUBS} more<MS name="expand_more" size={16} />
              </button>
            )}
          </>
        )}
      </div>

      {/* menu */}
      <div style={{ padding: '6px 16px 0' }}>
        {shownCats.every(cat => !available.some(i => i.category === cat && (activeSub === 'all' || i.subcategory_name === activeSub))) && (
          <p style={{ textAlign: 'center', color: 'var(--gb-muted)', fontSize: 14, padding: '48px 0', fontWeight: 500 }}>No items match your search</p>
        )}
        {shownCats.map(cat => {
          const catItems = sorted(available.filter(i => i.category === cat && (activeSub === 'all' || i.subcategory_name === activeSub)));
          if (!catItems.length) return null;
          return (
            <div key={cat}>
              <div className="gb-serif" style={{ fontSize: 18, fontWeight: 500, margin: '20px 4px 8px', color: '#3A302A' }}>{CATEGORY_LABELS[cat]}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 6 }}>
                {catItems.map(item => (
                  <div key={item.id} style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 16px -12px rgba(15, 23, 42,.4)' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                      <Image src={item.image_url || ph(placeholderFor(item))} alt={item.name} fill sizes="(max-width: 480px) 50vw, 220px" style={{ objectFit: 'cover' }} />
                      {/* ponytail: grabit_menu_items has no is_veg column at all (items sync
                          from Omega POS, whose own veg flag isn't mapped over) - item.is_veg
                          is always null. Every current item genuinely is veg, so hardcoding
                          the mark is accurate today; add the real column + Omega sync mapping
                          before this cafe's menu ever adds a non-veg item, or this mark lies. */}
                      <div style={{ position: 'absolute', top: 8, left: 8 }}><Veg veg={true} /></div>
                      {isLoggedIn && (
                        <button onClick={() => toggleFavorite(item.id)} aria-label={favIds.has(item.id) ? 'Remove favourite' : 'Add favourite'} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(15, 23, 42,.25)' }}>
                          <MS name={favIds.has(item.id) ? 'favorite' : 'favorite_border'} size={15} fill={favIds.has(item.id)} color={favIds.has(item.id) ? '#C0392B' : 'var(--gb-muted-2)'} />
                        </button>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px 16px', position: 'relative' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)', lineHeight: 1.3, minHeight: 36, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: 12, color: 'var(--gb-muted)', lineHeight: 1.35, marginTop: 3, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>}
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gb-text)', marginTop: 8, paddingRight: 60 }}>{inr(item.price)}</div>
                      {gridAddStep(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* floating cart bar */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', left: 16, right: 16, maxWidth: 448, margin: '0 auto', zIndex: 35, background: 'var(--gb-ink)', color: '#fff', borderRadius: 16, padding: '14px 14px 14px 18px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--gb-shadow-bar)' }}>
          <Link href={`/${slug}/cart`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, color: '#fff', minWidth: 0 }}>
            <span style={{ background: 'rgba(255,255,255,.16)', borderRadius: 9, padding: '6px 9px', fontSize: 13, fontWeight: 800 }}>{cartCount}</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>View cart · {inr(total())}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 14, fontWeight: 700, color: 'var(--gb-peach)' }}>Next<MS name="arrow_forward" size={19} /></span>
          </Link>
          <button onClick={() => setShowClearConfirm(true)} aria-label="Clear cart" style={{ flex: 'none', width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.16)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <MS name="close" size={16} />
          </button>
        </div>
      )}

      </div>

      {/* Rendered outside the grayscale-filtered block above: CSS `filter` on an ancestor
          becomes the containing block for descendant `position: fixed` elements (same as
          `transform`), so a sheet/dialog nested inside it pins to that div's box instead of
          the real viewport - it'd render off past the bottom of the screen once the cafe
          closes and the filter kicks in. */}
      {showSubSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowSubSheet(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '18px 20px calc(20px + env(safe-area-inset-bottom))', width: '100%', maxHeight: '70vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)', marginBottom: 14 }}>Filter by</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              <button style={chip(activeSub === 'all')} onClick={() => { setActiveSub('all'); setShowSubSheet(false); }}>All</button>
              {subsPresent.map(s => (
                <button key={s} style={chip(activeSub === s)} onClick={() => { setActiveSub(s); setShowSubSheet(false); }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSortSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowSortSheet(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '18px 20px calc(20px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 448, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)', marginBottom: 14 }}>Sort & filter</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SORT_MODES.map(m => {
                const active = sortMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setSortMode(m.id); setShowSortSheet(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 6px', border: 'none',
                      background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--gb-line)',
                      fontSize: 14.5, fontWeight: active ? 800 : 600, color: active ? 'var(--gb-primary)' : 'var(--gb-text)',
                    }}
                  >
                    <MS name={m.icon} size={18} color={active ? 'var(--gb-primary)' : 'var(--gb-muted-2)'} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{m.label}</span>
                    {active && <MS name="check" size={18} color="var(--gb-primary)" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowClearConfirm(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 22, width: '100%', maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>Clear cart?</div>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', marginTop: 6, lineHeight: 1.4 }}>Your {cartCount} item{cartCount > 1 ? 's' : ''} will be removed.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowClearConfirm(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid var(--gb-line-2)', background: '#fff', color: 'var(--gb-text)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>No</button>
              <button onClick={() => { clearCart(); setShowClearConfirm(false); }} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--gb-ink)', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {addonSheetItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setAddonSheetItem(null)}>
          <div style={{ background: '#fff', borderRadius: '18px 18px 0 0', padding: 22, width: '100%', maxWidth: 448 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>{addonSheetItem.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gb-muted)', marginTop: 4 }}>Add extras</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {addonsFor(addonSheetItem).map(a => (
                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.has(a.id)}
                    onChange={() => setSelectedAddonIds(prev => {
                      const next = new Set(prev);
                      next.has(a.id) ? next.delete(a.id) : next.add(a.id);
                      return next;
                    })}
                  />
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--gb-text)' }}>{a.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>{inr(a.price)}</span>
                </label>
              ))}
            </div>
            <button
              onClick={confirmAddonSheet}
              style={{ width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 12, border: 'none', background: 'var(--gb-ink)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
