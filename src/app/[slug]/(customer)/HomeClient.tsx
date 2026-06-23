'use client';
import Link from 'next/link';
import type { GrabitCafe, GrabitMenuItem, GrabitMenuCategory } from '@gradient365/gradient-commons';
import { useCart } from '@/store/cart';
import { Card, Photo, FoodMark, AddButton, Button, Icon } from '@/components/ui/kit';

interface TopItem {
  menu_item_id: number;
  menu_item_name: string;
  price: number;
  image_url: string | null;
  total_ordered: number;
}

interface Props {
  slug: string;
  cafe: GrabitCafe;
  items: GrabitMenuItem[];
  customerName: string | null;
  topItems: TopItem[];
  isLoggedIn: boolean;
  isProfileComplete: boolean;
}

const CATEGORY_LABELS: Record<GrabitMenuCategory, string> = {
  drinks: 'Drinks',
  food: 'Food',
  specials: 'Specials',
  desserts: 'Desserts',
};

const CATEGORY_ORDER: GrabitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function HomeClient({ slug, cafe, items, customerName, topItems, isLoggedIn }: Props) {
  const { addItem, updateQty, items: cartItems, total } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const qtyOf = (id: number) => cartItems.find(i => i.menu_item_id === id)?.quantity ?? 0;

  function add(item: GrabitMenuItem) {
    addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }, slug);
  }
  function addTop(item: TopItem) {
    addItem({ menu_item_id: item.menu_item_id, name: item.menu_item_name, price: item.price, quantity: 1, image_url: item.image_url }, slug);
  }

  const byCategory = items.reduce<Partial<Record<GrabitMenuCategory, GrabitMenuItem[]>>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh', background: 'var(--surface)' }}>
      <div className="noscroll" style={{ paddingBottom: cartCount > 0 ? 150 : 40 }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: 264 }}>
          <Photo seed={2} radius="0" src={cafe.image_url || undefined} label="Cafe cover" style={{ position: 'absolute', inset: 0, height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.14) 56%, rgba(0,0,0,0.74) 100%)' }} />
          <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.92)', borderRadius: 'var(--r-pill)', padding: '6px 12px 6px 8px', color: 'var(--on-surface)', fontWeight: 700, fontSize: 13 }}>
              {Icon.chevL({ size: 18 })} Cafes
            </Link>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 11px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.92)', fontSize: 12.5, fontWeight: 700, color: 'var(--success)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />Open now
            </span>
          </div>
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.25)', color: 'var(--primary)' }}>
                {Icon.flame({ size: 26 })}
              </div>
            </div>
            <div className="t-display" style={{ fontSize: 32, textShadow: '0 2px 10px rgba(0,0,0,.3)' }}>{cafe.name}</div>
            <div style={{ fontSize: 14.5, fontWeight: 500, opacity: 0.95, marginTop: 4 }}>
              {cafe.city ? `${cafe.city} · ` : ''}Order ahead, skip the queue
            </div>
          </div>
        </div>

        {/* Greeting (returning users) */}
        {isLoggedIn && customerName && (
          <div style={{ padding: '16px 20px 0' }}>
            <div className="t-caption" style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, color: 'var(--primary)' }}>
              Welcome back
            </div>
            <div className="t-title" style={{ marginTop: 2 }}>Hey {customerName}, the usual?</div>
          </div>
        )}

        {/* Your usuals */}
        {isLoggedIn && topItems.length > 0 && (
          <div style={{ padding: '18px 0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
              <span className="t-title">Your usuals</span>
              <span className="t-caption" style={{ fontWeight: 600, color: 'var(--primary)' }}>Tap to re-add</span>
            </div>
            <div className="noscroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px' }}>
              {topItems.map(item => (
                <div key={item.menu_item_id} style={{ flex: 'none', width: 132 }}>
                  <Card pad={0} style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <Photo seed={item.menu_item_id} src={item.image_url || undefined} label={item.menu_item_name} radius="0" ratio="1.25" />
                      <button onClick={() => addTop(item)} aria-label="Add" style={{ position: 'absolute', right: 8, bottom: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 3px 10px rgba(183,18,42,.4)' }}>
                        {Icon.plus({ size: 18 })}
                      </button>
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }} className="clamp1">{item.menu_item_name}</span>
                      <div className="t-price tabular" style={{ fontSize: 14, marginTop: 4 }}>{inr(item.price)}</div>
                      <div className="t-caption" style={{ marginTop: 2 }}>Ordered {item.total_ordered}×</div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login nudge */}
        {!isLoggedIn && (
          <div style={{ padding: '16px 20px 0' }}>
            <Card style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--primary-tint)', border: '1px solid var(--primary-tint-strong)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>{Icon.clock({ size: 24 })}</div>
              <div style={{ flex: 1 }}>
                <div className="t-headline-card" style={{ color: 'var(--primary)' }}>Skip the queue</div>
                <div className="t-caption" style={{ color: 'var(--on-surface-variant)' }}>Order now, pick a 15-min slot, walk past the line.</div>
              </div>
              <Link href={`/${slug}/login`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>Log in →</Link>
            </Card>
          </div>
        )}

        {/* Menu by category */}
        {CATEGORY_ORDER.filter(cat => byCategory[cat]?.length).map(category => (
          <section key={category} style={{ padding: '20px 20px 0' }}>
            <div className="t-subtitle" style={{ marginBottom: 12 }}>{CATEGORY_LABELS[category]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {byCategory[category]!.map(item => {
                const qty = qtyOf(item.id);
                const soldOut = !item.is_available;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 14, opacity: soldOut ? 0.55 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <FoodMark veg size={14} />
                      </div>
                      <div className="t-headline-card">{item.name}</div>
                      {item.description && <div className="t-caption clamp2" style={{ marginTop: 3, paddingRight: 8 }}>{item.description}</div>}
                      <div className="t-price tabular" style={{ marginTop: 8 }}>{inr(item.price)}</div>
                    </div>
                    <div style={{ width: 104, flex: 'none', position: 'relative' }}>
                      <Photo seed={item.id} src={item.image_url || undefined} label={item.name} ratio="1" radius="var(--r-md)" />
                      <div style={{ position: 'absolute', left: '50%', bottom: -16, transform: 'translateX(-50%)' }}>
                        {soldOut
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', background: '#fff', border: '1px solid var(--hairline-strong)', padding: '6px 10px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap' }}>Sold out</span>
                          : <AddButton qty={qty} onAdd={() => add(item)} onChange={(v) => updateQty(item.id, v)} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Floating cart dock */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 35, maxWidth: 480, margin: '0 auto', padding: '12px 20px 16px', background: 'linear-gradient(to top, var(--surface) 62%, transparent)' }}>
          <Link href={`/${slug}/cart`} style={{ display: 'block' }}>
            <Button full style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="tabular" style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 8, minWidth: 24, height: 24, display: 'grid', placeItems: 'center', fontSize: 13, padding: '0 4px' }}>{cartCount}</span>
                {cartCount === 1 ? 'item' : 'items'} · <span className="tabular">{inr(total())}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>View Cart {Icon.chevR({ size: 18 })}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
