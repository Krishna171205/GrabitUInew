'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabitOrderWithItems, GrabitOrderStatus } from '@gradient365/gradient-commons';
import { TopBar, Card, FoodMark, Icon } from '@/components/ui/kit';

const STATUS_LABELS: Record<GrabitOrderStatus, string> = {
  pending: 'Awaiting payment',
  new_order: 'Awaiting confirmation',
  confirmed: 'Order confirmed',
  prepping: 'Being prepared',
  ready: 'Ready for pickup!',
  completed: 'Picked up',
  cancelled: 'Cancelled',
};

// Live status copy under the stepper.
const LIVE_COPY: Record<GrabitOrderStatus, string> = {
  pending: 'Sent to the cafe — waiting for payment…',
  new_order: 'Sent to the cafe — waiting for them to confirm…',
  confirmed: 'Confirmed! The barista will start prepping shortly.',
  prepping: 'Your order is being prepared right now.',
  ready: 'Ready for pickup — head to the counter!',
  completed: 'Picked up. Enjoy! ☕',
  cancelled: 'This order was cancelled.',
};

const STEPS = [
  { label: 'Pending', icon: Icon.clock },
  { label: 'Confirmed', icon: Icon.check },
  { label: 'Ready', icon: Icon.bag },
  { label: 'Done', icon: Icon.check },
];
function stepIndex(s: GrabitOrderStatus): number {
  const map: Record<GrabitOrderStatus, number> = {
    pending: 0, new_order: 0, confirmed: 1, prepping: 1, ready: 2, completed: 3, cancelled: 0,
  };
  return map[s] ?? 0;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function OrderPage() {
  const { id, slug } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<GrabitOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/proxy/grabit/orders/${id}`)
      .then((res) => res.json())
      .then((data) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));

    // Live updates via polling the backend (RDS-backed), replacing Supabase Realtime.
    const poll = setInterval(() => {
      fetch(`/api/proxy/grabit/orders/${id}`)
        .then((res) => res.json())
        .then((data) => setOrder(data))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(poll);
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--muted)', fontSize: 17, background: 'var(--surface)' }}>Loading…</div>;
  }
  if (!order) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--muted)', fontSize: 17, background: 'var(--surface)' }}>Order not found</div>;
  }

  const pickupTime = new Date(order.pickup_slot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const total = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const idx = stepIndex(order.status);
  const isReady = order.status === 'ready';
  const isDone = order.status === 'completed';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative', paddingBottom: 40 }}>
      <TopBar
        title="Order status"
        onBack={() => router.push(`/${slug}`)}
        right={<button onClick={() => router.push(`/${slug}`)} aria-label="Home" style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--on-surface)', display: 'grid', placeItems: 'center' }}>{Icon.home({ size: 22 })}</button>}
      />

      {/* Success header */}
      <div style={{ textAlign: 'center', padding: '8px 24px 22px' }}>
        <div style={{ position: 'relative', width: 84, height: 84, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--success-tint)' }} />
          <svg viewBox="0 0 84 84" style={{ position: 'relative' }} width="84" height="84">
            <circle cx="42" cy="42" r="30" fill="none" stroke="var(--success)" strokeWidth="3.5" opacity="0.25" />
            <path d="M28 43 L38 53 L57 32" fill="none" stroke="var(--success)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="t-title">{isDone ? 'Order complete' : isReady ? 'Your order is ready!' : 'Order Confirmed'}</div>
        <div className="t-caption" style={{ marginTop: 4 }}>We&apos;ll ping you on WhatsApp when it&apos;s ready.</div>
        <div className="tabular" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)', padding: '7px 14px', fontWeight: 700, fontSize: 15 }}>
          #{order.id} <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13 }}>· Pickup {pickupTime}</span>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Live stepper */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 19, left: 28, right: 28, height: 3, background: 'var(--surface-container)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', top: 19, left: 28, height: 3, background: 'var(--success)', borderRadius: 3, transition: 'width .6s var(--ease-out)', width: `calc((100% - 56px) * ${idx / (STEPS.length - 1)})` }} />
            {STEPS.map((s, i) => {
              const done = i < idx, current = i === idx;
              return (
                <div key={s.label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 64, zIndex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: done ? 'var(--success)' : current ? 'var(--primary)' : 'var(--surface-card)', color: done || current ? '#fff' : 'var(--muted-2)', border: done || current ? 'none' : '2px solid var(--surface-dim)', animation: current ? 'pulse-ring 1.8s infinite' : 'none', transition: 'all .3s' }}>
                    {done ? Icon.check({ size: 20 }) : s.icon({ size: 19 })}
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: current ? 700 : 500, color: current ? 'var(--primary)' : done ? 'var(--success)' : 'var(--muted)' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-ring 1.8s infinite', flex: 'none' }} />
            <span className="t-caption" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{LIVE_COPY[order.status]}</span>
          </div>
        </Card>

        {/* Show at counter */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 84, height: 84, borderRadius: 'var(--r-md)', background: '#fff', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--on-surface)' }}>
            {Icon.qr({ size: 62, sw: 1.2 })}
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-headline-card">Show this at the counter</div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.04em', marginTop: 4 }}>#{order.id}</div>
            <div className="t-caption" style={{ marginTop: 2 }}>{STATUS_LABELS[order.status]} · Pickup {pickupTime}</div>
          </div>
        </Card>

        {/* Items */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="t-label">{itemCount} item{itemCount === 1 ? '' : 's'}</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FoodMark veg size={14} />
              <span className="tabular" style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13, minWidth: 24 }}>{item.quantity}×</span>
              <span className="t-body" style={{ flex: 1 }}>{item.menu_item_name}</span>
              <span className="t-price tabular" style={{ fontSize: 14 }}>{inr(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--hairline)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span><span className="tabular">{inr(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
