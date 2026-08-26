'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MS, NavSpacer } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import type { RealCafe } from '@/components/gb/cards';
import { useCart } from '@/store/cart';

interface OrderItem {
  id: number; menu_item_id: number; menu_item_name: string; quantity: number; unit_price: number;
  addons?: { id: number; name: string; price: number }[];
}
interface Order {
  id: number; cafe_id: number; status: string; payment_method: string; payment_status: string;
  total_amount: number; created_at: string; items: OrderItem[];
}

// An online order whose payment failed never became a real order — treat it as
// past/dead, not "active", regardless of its (still-pending) fulfillment status.
function isActive(o: Order) {
  if (o.status === 'completed' || o.status === 'cancelled') return false;
  if (o.payment_method === 'online' && o.payment_status === 'failed') return false;
  return true;
}

function statusLabel(o: Order): { text: string; color: string; bg: string; icon: string } {
  if (o.payment_method === 'online' && o.payment_status === 'failed')
    return { text: 'Payment failed', color: 'var(--gb-danger)', bg: '#FDECEA', icon: 'error' };
  switch (o.status) {
    case 'pending': return { text: 'Awaiting confirmation', color: 'var(--gb-muted-2)', bg: 'var(--gb-surface)', icon: 'schedule' };
    case 'new_order': case 'confirmed': return { text: 'Confirmed', color: 'var(--gb-green)', bg: '#E9F5EC', icon: 'check_circle' };
    case 'prepping': return { text: 'Preparing', color: 'var(--gb-green)', bg: '#E9F5EC', icon: 'restaurant' };
    case 'ready': return { text: 'Ready for pickup', color: 'var(--gb-green)', bg: '#E9F5EC', icon: 'check_circle' };
    case 'completed': return { text: 'Picked up', color: 'var(--gb-muted-2)', bg: 'var(--gb-surface)', icon: 'check_circle' };
    case 'cancelled': return { text: 'Cancelled', color: 'var(--gb-danger)', bg: '#FDECEA', icon: 'cancel' };
    default: return { text: o.status, color: 'var(--gb-muted-2)', bg: 'var(--gb-surface)', icon: 'schedule' };
  }
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    + ', ' + new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function OrderRow({ o, cafeName, cafeSlug, cafeLogo }: { o: Order; cafeName: string; cafeSlug?: string; cafeLogo?: string | null }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const s = statusLabel(o);
  const initial = cafeName.trim().charAt(0).toUpperCase() || '?';
  const canReorder = cafeSlug && o.items.length > 0;

  // Nested inside the card's Link, so this has to be a button: the card opens the
  // order, this opens the cafe's menu, which is what the label always claimed.
  function viewMenu(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (cafeSlug) router.push(`/${cafeSlug}`);
  }

  function reorder(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!cafeSlug) return;
    o.items.forEach(i => addItem({
      menu_item_id: i.menu_item_id, name: i.menu_item_name, price: i.unit_price,
      quantity: i.quantity, image_url: null, addons: i.addons,
    }, cafeSlug));
    router.push(`/${cafeSlug}/cart`);
  }

  async function share(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setMenuOpen(false);
    if (!cafeSlug) return;
    const url = `${window.location.origin}/${cafeSlug}`;
    if (navigator.share) {
      navigator.share({ title: cafeName, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-md)', marginBottom: 12, overflow: 'hidden', boxShadow: 'var(--gb-elev-2)', position: 'relative' }}>
      <Link href={cafeSlug ? `/${cafeSlug}/order/${o.id}` : '#'} style={{ display: 'block', padding: '14px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {cafeLogo ? (
            <div style={{ width: 44, height: 44, borderRadius: '50%', flex: 'none', background: '#fff', border: '1px solid var(--gb-line-2)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cafeLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 'var(--gb-r-sm)', flex: 'none', background: 'linear-gradient(135deg, var(--gb-primary) 0%, #7A2E17 100%)', display: 'grid', placeItems: 'center' }}>
              <span className="gb-serif" style={{ fontSize: 19, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{initial}</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* The kebab is positioned absolutely at the top right of the card, so this
                row keeps its 28px (plus the 12px inset) clear of anything. */}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)', paddingRight: cafeSlug ? 30 : 0 }}>{cafeName}</div>
            <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {o.items.map((i) => i.quantity > 1 ? `${i.menu_item_name} ×${i.quantity}` : i.menu_item_name).join(', ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 11, borderTop: '1px dashed var(--gb-line-2)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600 }}>{fmtWhen(o.created_at)}</div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--gb-text)' }}>{inr(o.total_amount)}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 999 }}>
            <MS name={s.icon} size={13} fill />{s.text}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {cafeSlug && (
              <button onClick={viewMenu} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontSize: 12, fontWeight: 700, padding: '6px 2px', cursor: 'pointer' }}>
                View menu<MS name="chevron_right" size={14} />
              </button>
            )}
            {canReorder && (
              <button onClick={reorder} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--gb-line-3)', background: '#fff', color: 'var(--gb-primary)', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999, cursor: 'pointer' }}>
                <MS name="replay" size={14} />Reorder
              </button>
            )}
          </div>
        </div>
      </Link>

      {cafeSlug && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="More options"
            style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--gb-muted-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <MS name="more_vert" size={19} />
          </button>
          {menuOpen && (
            <>
              <div onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{ position: 'absolute', top: 40, right: 12, zIndex: 41, background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-sm)', boxShadow: 'var(--gb-elev-3)', overflow: 'hidden', minWidth: 168 }}>
                <button onClick={share} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--gb-text)', cursor: 'pointer', textAlign: 'left' }}>
                  <MS name="share" size={17} />Share restaurant
                </button>
                <Link href={`/${cafeSlug}/order/${o.id}`} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--gb-text)', borderTop: '1px solid var(--gb-line)' }}>
                  <MS name="receipt_long" size={17} />Order details
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [cafes, setCafes] = useState<RealCafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/grabit/orders/mine').then((r) => (r.ok ? r.json() : [])),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([o, c]) => { setOrders(o); setCafes(c); })
      .finally(() => setLoading(false));
  }, []);

  const cafeById = new Map(cafes.map((c) => [c.id, c]));
  // An online order whose payment hasn't resolved yet (still 'pending') isn't a
  // real order to the customer - they never completed checkout. The row exists
  // server-side because Cashfree needs an order to attach a payment session to,
  // but showing it as "Awaiting confirmation" here reads as a phantom order.
  // Once it resolves to paid (active) or failed (past), it shows normally.
  const resolvedOrders = orders.filter((o) => !(o.payment_method === 'online' && o.payment_status === 'pending'));
  const active = resolvedOrders.filter(isActive);
  const past = resolvedOrders.filter((o) => !isActive(o));
  const q = query.trim().toLowerCase();
  const matchesQuery = (o: Order) => {
    if (!q) return true;
    const cafeName = cafeById.get(o.cafe_id)?.name?.toLowerCase() ?? '';
    if (cafeName.includes(q)) return true;
    return o.items.some((i) => i.menu_item_name.toLowerCase().includes(q));
  };
  const shown = (tab === 'active' ? active : past).filter(matchesQuery);

  const pill = (isOn: boolean) => ({
    border: `1px solid ${isOn ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`,
    background: isOn ? 'var(--gb-ink)' : '#fff', color: isOn ? '#fff' : '#5A4E42',
    fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  });

  return (
    <div className="gb-shell gb-shell-wide">
      <div style={{ paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 20, paddingRight: 20, paddingBottom: 6 }}>
        <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.01em' }}>Your orders</div>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <div className="gb-search-cap" style={{ position: 'relative' }}>
          <MS name="search" size={19} color="var(--gb-muted-2)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by restaurant or dish"
            style={{ width: '100%', border: '1px solid var(--gb-line-2)', background: 'var(--gb-card)', borderRadius: 'var(--gb-r-sm)', padding: '12px 14px 12px 42px', fontSize: 14, color: 'var(--gb-text)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 4px' }}>
        <button style={pill(tab === 'active')} onClick={() => setTab('active')}>Active ({active.length})</button>
        <button style={pill(tab === 'past')} onClick={() => setTab('past')}>Past ({past.length})</button>
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 600 }}>
            {q ? 'No orders match your search.' : tab === 'active' ? 'No active orders right now.' : 'No past orders yet.'}
          </div>
        ) : (
          /* One order per row on a phone, a grid of them on a laptop. */
          <div className="gb-card-grid">
            {shown.map((o) => (
              <OrderRow key={o.id} o={o} cafeName={cafeById.get(o.cafe_id)?.name ?? 'Grabbit'} cafeSlug={cafeById.get(o.cafe_id)?.slug} cafeLogo={cafeById.get(o.cafe_id)?.logo_url} />
            ))}
          </div>
        )}
      </div>
      <NavSpacer />
    </div>
  );
}
