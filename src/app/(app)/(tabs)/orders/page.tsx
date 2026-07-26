'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MS, NavSpacer } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import type { RealCafe } from '@/components/gb/cards';

interface OrderItem { id: number; menu_item_id: number; menu_item_name: string; quantity: number; unit_price: number; }
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

function statusLabel(o: Order): { text: string; color: string; icon: string } {
  if (o.payment_method === 'online' && o.payment_status === 'failed') return { text: 'Payment failed', color: 'var(--gb-danger)', icon: 'cancel' };
  switch (o.status) {
    case 'pending': return { text: 'Awaiting confirmation', color: 'var(--gb-muted-2)', icon: 'schedule' };
    case 'new_order': case 'confirmed': return { text: 'Confirmed', color: 'var(--gb-green)', icon: 'check_circle' };
    case 'prepping': return { text: 'Preparing', color: 'var(--gb-green)', icon: 'restaurant' };
    case 'ready': return { text: 'Ready for pickup', color: 'var(--gb-green)', icon: 'check_circle' };
    case 'completed': return { text: 'Picked up', color: 'var(--gb-green)', icon: 'check_circle' };
    case 'cancelled': return { text: 'Cancelled', color: 'var(--gb-danger)', icon: 'cancel' };
    default: return { text: o.status, color: 'var(--gb-muted-2)', icon: 'schedule' };
  }
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function OrderRow({ o, cafeName, cafeSlug }: { o: Order; cafeName: string; cafeSlug?: string }) {
  const s = statusLabel(o);
  const itemsLabel = o.items.map((i) => (i.quantity > 1 ? `${i.menu_item_name} ×${i.quantity}` : i.menu_item_name)).join(', ');
  const inner = (
    <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13, marginBottom: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <MS name="restaurant" size={22} color="var(--gb-primary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{cafeName}</div>
        <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemsLabel} · {inr(o.total_amount)}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 11.5, fontWeight: 700, color: s.color }}>
          <MS name={s.icon} size={14} fill />{s.text} · {fmtWhen(o.created_at)}
        </div>
      </div>
      {cafeSlug && <MS name="chevron_right" size={20} color="var(--gb-icon)" />}
    </div>
  );
  return cafeSlug ? <Link href={`/${cafeSlug}`}>{inner}</Link> : inner;
}

export default function OrdersPage() {
  const [tab, setTab] = useState<'active' | 'past'>('active');
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
  const active = orders.filter(isActive);
  const past = orders.filter((o) => !isActive(o));
  const shown = tab === 'active' ? active : past;

  const pill = (isOn: boolean) => ({
    border: `1px solid ${isOn ? 'var(--gb-ink)' : 'var(--gb-line-3)'}`,
    background: isOn ? 'var(--gb-ink)' : '#fff', color: isOn ? '#fff' : '#5A4E42',
    fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
  });

  return (
    <div className="gb-shell">
      <div style={{ paddingTop: 'calc(30px + env(safe-area-inset-top))', paddingLeft: 20, paddingRight: 20, paddingBottom: 6 }}>
        <div className="gb-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.01em' }}>Your orders</div>
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
            {tab === 'active' ? 'No active orders right now.' : 'No past orders yet.'}
          </div>
        ) : (
          shown.map((o) => (
            <OrderRow key={o.id} o={o} cafeName={cafeById.get(o.cafe_id)?.name ?? 'Grabit'} cafeSlug={cafeById.get(o.cafe_id)?.slug} />
          ))
        )}
      </div>
      <NavSpacer />
    </div>
  );
}
