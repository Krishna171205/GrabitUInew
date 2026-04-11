'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { GrabitCafe, GrabitMenuItem, GrabitMenuCategory } from '@gradient365/types';
import { useCart } from '@/store/cart';

const CATEGORIES: GrabitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];
const CATEGORY_LABELS: Record<GrabitMenuCategory, string> = {
  drinks: 'Drinks', food: 'Food', specials: 'Specials', desserts: 'Desserts'
};

interface Props { slug: string; cafe: GrabitCafe; items: GrabitMenuItem[]; }

export default function MenuClient({ slug, cafe, items }: Props) {
  const [activeCategory, setActiveCategory] = useState<GrabitMenuCategory>('drinks');
  const { addItem, items: cartItems, total } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const visibleItems = items.filter(i => i.is_available && i.category === activeCategory);
  const categoriesPresent = CATEGORIES.filter(c => items.some(i => i.category === c && i.is_available));

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--g-border)', padding: '0 16px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href={`/${slug}`} style={{ fontSize: '14px', color: 'var(--g-muted)' }}>← Back</Link>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>{cafe.name}</span>
        {cartCount > 0 ? (
          <Link href={`/${slug}/cart`} style={{
            background: 'var(--g-amber)', color: '#fff', borderRadius: '980px',
            padding: '6px 14px', fontSize: '13px', fontWeight: 600
          }}>Cart · {cartCount}</Link>
        ) : <span style={{ width: '60px' }} />}
      </nav>

      {/* Category tabs */}
      <div style={{
        position: 'sticky', top: '48px', zIndex: 40,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--g-border)',
        padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto'
      }}>
        {categoriesPresent.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px', borderRadius: '980px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--g-amber)' : 'var(--g-surface)',
              color: activeCategory === cat ? '#fff' : 'var(--g-text)'
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleItems.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--g-muted)', padding: '48px 0' }}>
            Nothing in this category right now
          </p>
        )}
        {visibleItems.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: 'var(--g-surface)', borderRadius: '14px', gap: '12px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                {item.name}
              </p>
              {item.description && (
                <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginBottom: '4px' }}>
                  {item.description}
                </p>
              )}
              <p style={{ fontWeight: 700, color: 'var(--g-amber)' }}>₹{item.price}</p>
            </div>
            <button
              onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }, slug)}
              style={{
                flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--g-amber)', color: '#fff', border: 'none',
                fontSize: '20px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', lineHeight: 1
              }}
            >+</button>
          </div>
        ))}
      </div>

      {/* Floating cart CTA */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, width: 'calc(100% - 48px)', maxWidth: '432px'
        }}>
          <Link href={`/${slug}/cart`} style={{
            display: 'block', background: 'var(--g-amber)', color: '#fff',
            padding: '16px 24px', borderRadius: '980px', fontWeight: 700, fontSize: '16px',
            textAlign: 'center', boxShadow: 'rgba(255,107,0,0.38) 0 6px 18px'
          }}>
            View Cart · {cartCount} item{cartCount > 1 ? 's' : ''} · ₹{total()}
          </Link>
        </div>
      )}
    </div>
  );
}
