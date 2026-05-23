'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GrabitCafe, GrabitMenuItem, GrabitMenuCategory } from '@gradient365/gradient-commons';
import { useCart } from '@/store/cart';

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
  drinks: '☕ Drinks',
  food: '🍔 Food',
  specials: '⭐ Specials',
  desserts: '🍰 Desserts',
};

const CATEGORY_ORDER: GrabitMenuCategory[] = ['drinks', 'food', 'specials', 'desserts'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeClient({ slug, cafe, items, customerName, topItems, isLoggedIn, isProfileComplete }: Props) {
  const { addItem, items: cartItems, total } = useCart();
  const router = useRouter();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  function handleAddItem(item: Parameters<typeof addItem>[0]) {
    if (isLoggedIn && !isProfileComplete) {
      router.push(`/${slug}/profile?required=1`);
      return;
    }
    if (!isLoggedIn) {
      router.push(`/${slug}/login`);
      return;
    }
    addItem(item, slug);
  }

  const byCategory = items.reduce<Partial<Record<GrabitMenuCategory, GrabitMenuItem[]>>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category]!.push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '120px', background: 'var(--g-white)', minHeight: '100vh' }}>
      {/* Sticky nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--g-border)',
        padding: '0 20px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--g-muted)', textDecoration: 'none', fontWeight: 600 }}>
          ← Cafes
        </Link>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>{cafe.name}</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isLoggedIn && (
            <Link href={`/${slug}/profile`} style={{ fontSize: '20px', textDecoration: 'none' }}>👤</Link>
          )}
          {cartCount > 0 && (
            <Link href={`/${slug}/cart`} style={{
              background: 'var(--g-amber)', color: '#fff',
              borderRadius: '980px', padding: '6px 14px',
              fontSize: '13px', fontWeight: 700, textDecoration: 'none'
            }}>
              Cart · {cartCount}
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'var(--g-amber-tint)', padding: '24px 20px 20px' }}>
        {isLoggedIn ? (
          <>
            <p style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: 'var(--g-amber)', marginBottom: '6px'
            }}>
              {greeting()}{customerName ? `, ${customerName}` : ''} ☕
            </p>
            <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.06 }}>
              What&apos;ll it be today?
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--g-muted)', marginTop: '4px' }}>
              {cafe.name} · Order ahead, skip the queue
            </p>
          </>
        ) : (
          <>
            <p style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: 'var(--g-amber)', marginBottom: '6px'
            }}>
              ORDER AHEAD · SKIP THE QUEUE
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.06 }}>
              What&apos;ll it be today?
            </h1>
            <Link href={`/${slug}/login`} style={{
              display: 'inline-block', marginTop: '12px',
              fontSize: '13px', fontWeight: 700, color: 'var(--g-amber)', textDecoration: 'none'
            }}>
              Login to save your favourites →
            </Link>
          </>
        )}
      </div>

      {/* Favourites (only if logged in and has history) */}
      {isLoggedIn && topItems.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: '10px'
          }}>Your Favourites</p>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {topItems.map(item => (
              <div key={item.menu_item_id} style={{
                flexShrink: 0, background: 'var(--g-white)',
                border: '1px solid var(--g-border)', borderRadius: '12px',
                padding: '10px 14px', minWidth: '110px', cursor: 'pointer'
              }}
              onClick={() => handleAddItem({
                menu_item_id: item.menu_item_id,
                name: item.menu_item_name,
                price: item.price,
                quantity: 1,
                image_url: item.image_url
              })}>
                <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '3px' }}>{item.menu_item_name}</p>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--g-amber)' }}>₹{item.price}</p>
                <p style={{ fontSize: '10px', color: 'var(--g-muted)', marginTop: '2px' }}>Ordered {item.total_ordered}×</p>
              </div>
            ))}
          </div>
          <div style={{ height: '1px', background: 'var(--g-border)', margin: '20px 0 0' }} />
        </div>
      )}

      {/* Menu by category */}
      {CATEGORY_ORDER.filter(cat => byCategory[cat]?.length).map(category => (
        <section key={category} style={{ padding: '20px 20px 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
            {CATEGORY_LABELS[category]}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {byCategory[category]!.filter(item => item.is_available).map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--g-surface)', borderRadius: '14px', padding: '12px 14px'
              }}>
                {/* Image placeholder */}
                <div style={{
                  width: '60px', height: '60px', borderRadius: '12px', flexShrink: 0,
                  background: item.image_url ? 'transparent' : 'var(--g-amber-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: item.image_url ? '0' : '22px',
                  overflow: 'hidden'
                }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (category === 'drinks' ? '☕' : category === 'food' ? '🍔' : category === 'desserts' ? '🍰' : '⭐')
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '2px' }}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: '12px', color: 'var(--g-muted)', marginBottom: '3px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </p>
                  )}
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g-amber)' }}>₹{item.price}</p>
                </div>
                <button
                  onClick={() => handleAddItem({
                    menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url
                  })}
                  style={{
                    flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
                    background: 'var(--g-amber)', color: '#fff', border: 'none',
                    fontSize: '20px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255,107,0,0.3)', fontWeight: 300, lineHeight: 1
                  }}>+</button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Floating cart */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, width: 'calc(100% - 48px)', maxWidth: '432px'
        }}>
          <Link href={`/${slug}/cart`} style={{
            display: 'block', background: 'var(--g-amber)', color: '#fff',
            padding: '16px 24px', borderRadius: '980px', fontWeight: 700,
            fontSize: '16px', textAlign: 'center', textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(255,107,0,0.38)'
          }}>
            View Cart · {cartCount} item{cartCount > 1 ? 's' : ''} · ₹{total()}
          </Link>
        </div>
      )}
    </div>
  );
}
