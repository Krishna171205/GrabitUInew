'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabitOrderWithItems, GrabitOrderStatus } from '@gradient365/gradient-commons';
import { MS } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';

function stepIndex(s: GrabitOrderStatus): number {
  const map: Record<GrabitOrderStatus, number> = {
    pending: 0, new_order: 0, confirmed: 1, prepping: 1, ready: 2, completed: 3, cancelled: 0,
  };
  return map[s] ?? 0;
}

type NodeState = 'done' | 'current' | 'upcoming';
function TimelineNode({ state, icon, title, sub, last }: { state: NodeState; icon: string; title: string; sub: string; last?: boolean }) {
  const bg = state === 'done' ? 'var(--gb-green)' : state === 'current' ? 'var(--gb-primary)' : '#fff';
  const border = state === 'upcoming' ? '2px solid #E7DCCC' : `2px solid ${bg}`;
  const iconColor = state === 'upcoming' ? '#C9BCA9' : '#fff';
  const dim = state === 'upcoming';
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: bg, border, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <MS name={state === 'done' ? 'check' : icon} size={15} fill color={iconColor} />
        </span>
        {!last && <span style={{ width: 2, flex: 1, background: '#EEE4D6', minHeight: 22 }} />}
      </div>
      <div style={{ paddingBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: dim ? '#A99C8B' : 'var(--gb-text)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const { id, slug } = useParams<{ slug: string; id: string }>();
  const token = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('t') ?? '')
    : '';
  const router = useRouter();
  const [order, setOrder] = useState<GrabitOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const refresh = (isPoll: boolean) =>
      fetch(`/api/proxy/grabit/orders/${id}?t=${encodeURIComponent(token)}`)
        .then(r => {
          if (r.status === 401 || r.status === 403) { setDenied(true); return null; }
          if (!r.ok) { setDenied(true); return null; }
          return r.json();
        })
        .then(d => { if (d) setOrder(d); if (!isPoll) setLoading(false); })
        .catch(() => { if (!isPoll) setLoading(false); });

    // The customer lands here straight from Cashfree checkout, so their arrival is the
    // earliest reliable signal that a payment happened. Ask the backend to confirm it
    // server-to-server right now rather than waiting on the webhook (which is delivered
    // by a third party and can be rejected or dropped) or on the reconciliation cron.
    // Without this the cafe's POS can sit blind for minutes on an order that is already
    // paid, which defeats the point of pre-ordering. Backend ignores the call unless the
    // order is genuinely online+pending, so a refresh or remount costs nothing.
    // Fire-and-forget: refresh() below renders whatever the truth turns out to be.
    fetch(`/api/proxy/grabit/orders/${id}/verify-payment?t=${encodeURIComponent(token)}`, { method: 'POST' })
      .catch(() => { /* cron remains the backstop */ })
      .finally(() => refresh(true));

    refresh(false);

    // Pass the per-order token so magic-link visitors (no cookie) still get live
    // updates; cookie-authed sessions work with or without it (proxy prefers cookie).
    const streamUrl = token
      ? `/api/stream/grabit/orders/order/${id}?t=${encodeURIComponent(token)}`
      : `/api/stream/grabit/orders/order/${id}`;
    const stream = new EventSource(streamUrl);
    const eventTypes = [
      'PAYMENT_CAPTURED',
      'ORDER_CONFIRMED',
      'ORDER_PREPPING',
      'ORDER_READY',
      'ORDER_COMPLETED',
      'ORDER_STATUS_CHANGED',
    ];
    const onEvent = () => refresh(true);
    eventTypes.forEach(type => stream.addEventListener(type, onEvent));
    // Do NOT close() on error: native EventSource auto-reconnects with backoff and
    // resends Last-Event-ID (server replays missed events). Closing here would kill
    // that and silently degrade to polling. On reconnect, refetch to reconcile.
    stream.onerror = () => { refresh(true); };

    // Reconciliation remains the source of correctness after reconnects/deploys.
    const poll = setInterval(() => refresh(true), 60000);

    return () => {
      eventTypes.forEach(type => stream.removeEventListener(type, onEvent));
      stream.close();
      clearInterval(poll);
    };
  }, [id, slug, router, token]);

  const center = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--gb-muted)', fontSize: 16, background: 'var(--gb-surface)' } as const;
  if (loading) return <div style={center}>Loading…</div>;
  if (denied) return <div style={center}>You don&apos;t have access to this order</div>;
  if (!order) return <div style={center}>Order not found</div>;

  const cafeName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'the café';
  const pickupTime = new Date(order.pickup_slot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const idx = stepIndex(order.status);
  const nodeState = (threshold: number): NodeState => idx > threshold ? 'done' : idx === threshold ? 'current' : 'upcoming';

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 40 }}>
      {/* success header */}
      <div style={{ background: 'linear-gradient(158deg,#2A5238 0%,#38743F 100%)', paddingTop: 'calc(40px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 30, color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <MS name="check_circle" size={36} fill color="#fff" />
        </div>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 14 }}>Order placed</div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.82)', fontWeight: 500, marginTop: 4 }}>Pickup at {cafeName} · {pickupTime}</div>
      </div>

      {/* pickup code */}
      <div style={{ margin: '-16px 16px 0', position: 'relative', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 20, boxShadow: 'var(--gb-shadow-pop)', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gb-muted-2)' }}>Show this at the counter</div>
        <div className="gb-serif" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '.16em', color: 'var(--gb-primary)', marginTop: 6 }}>GB-{order.id}</div>
        <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600 }}>Skip the queue, collect &amp; go</div>
      </div>

      {/* timeline */}
      <div style={{ margin: '20px 20px 0' }}>
        <TimelineNode state={nodeState(0)} icon="check" title="Order confirmed" sub={`${cafeName} got your order`} />
        <TimelineNode state={nodeState(1)} icon="restaurant" title="Preparing your order" sub="Barista is on it" />
        <TimelineNode state={idx >= 2 ? (idx >= 3 ? 'done' : 'current') : 'upcoming'} icon="shopping_bag" title="Ready for pickup" sub="We'll ping you, skip the queue" last />
      </div>

      {/* café row */}
      <div style={{ margin: '4px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 15, display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=560&fit=crop&auto=format&q=72" alt={cafeName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{cafeName}</div>
          <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600 }}>0.4 km · 5 min walk</div>
        </div>
        <div style={{ background: '#F4EBDF', color: 'var(--gb-primary)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MS name="directions" size={22} />
        </div>
      </div>

      {/* back to home */}
      <button onClick={() => router.push('/home')} style={{ width: 'calc(100% - 32px)', margin: '20px 16px 0', border: '1px solid #E7DCCC', background: '#fff', color: 'var(--gb-ink)', fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 14, textAlign: 'center', cursor: 'pointer' }}>
        Back to home
      </button>
    </div>
  );
}
