'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GrabitCafe, GrabitMenuItem, GrabitMenuCategory } from '@gradient365/gradient-commons';
import { useCart } from '@/store/cart';
import { TopBar, Photo, FoodMark, AddButton, Button, Icon, Badge } from '@/components/ui/kit';

const CATEGORIES: GrabitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];
const CATEGORY_LABELS: Record<GrabitMenuCategory, string> = {
  drinks: 'Drinks', food: 'Food', specials: 'Specials', desserts: 'Desserts'
};

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

interface Props { slug: string; cafe: GrabitCafe; items: GrabitMenuItem[]; }

export default function MenuClient({ slug, cafe, items }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<GrabitMenuCategory>('drinks');
  const { addItem, updateQty, items: cartItems, total } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const qtyOf = (id: number) => cartItems.find(i => i.menu_item_id === id)?.quantity ?? 0;

  // Cache cafe_id in sessionStorage so checkout page doesn't need to re-fetch menu
  useEffect(() => {
    if (cafe?.id) sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(cafe.id));
  }, [slug, cafe?.id]);

  const visibleItems = items.filter(i => i.is_available && i.category === activeCategory);
  const categoriesPresent = CATEGORIES.filter(c => items.some(i => i.category === c && i.is_available));

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100dvh', background: 'var(--surface)', paddingBottom: cartCount > 0 ? 120 : 24 }}>
      <TopBar
        title={cafe.name}
        onBack={() => router.push(`/${slug}`)}
        right={
          <Link href={`/${slug}/cart`} aria-label="Cart" style={{ position: 'relative', width: 36, height: 36, display: 'grid', placeItems: 'center', color: 'var(--on-surface)' }}>
            {Icon.bag({ size: 23 })}
            {cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        }
      />

      {/* Sticky underline category tabs */}
      <div className="noscroll" style={{ position: 'sticky', top: 52, zIndex: 25, display: 'flex', gap: 22, overflowX: 'auto', padding: '0 20px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid var(--glass-border)' }}>
        {categoriesPresent.map(cat => {
          const on = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '14px 0 12px', fontSize: 15, fontWeight: on ? 700 : 500, color: on ? 'var(--primary)' : 'var(--muted)', position: 'relative', whiteSpace: 'nowrap' }}
            >
              {CATEGORY_LABELS[cat]}
              {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, borderRadius: 3, background: 'var(--primary)' }} />}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div style={{ padding: '8px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {visibleItems.length === 0 && (
          <p className="t-caption" style={{ textAlign: 'center', padding: '48px 0' }}>Nothing in this category right now</p>
        )}
        {visibleItems.map(item => {
          const qty = qtyOf(item.id);
          return (
            <div key={item.id} style={{ display: 'flex', gap: 14, paddingTop: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}><FoodMark veg size={14} /></div>
                <div className="t-headline-card">{item.name}</div>
                {item.description && <div className="t-caption clamp2" style={{ marginTop: 3, paddingRight: 8 }}>{item.description}</div>}
                <div className="t-price tabular" style={{ marginTop: 8 }}>{inr(item.price)}</div>
              </div>
              <div style={{ width: 104, flex: 'none', position: 'relative' }}>
                <Photo seed={item.id} src={item.image_url || undefined} label={item.name} ratio="1" radius="var(--r-md)" />
                <div style={{ position: 'absolute', left: '50%', bottom: -16, transform: 'translateX(-50%)' }}>
                  <AddButton
                    qty={qty}
                    onAdd={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }, slug)}
                    onChange={(v) => updateQty(item.id, v)}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 12 }} />
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
