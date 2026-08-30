'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GrabbitOrderWithItems, GrabbitOrderStatus } from '@gradient365/gradient-commons';
import { useCart } from '@/store/cart';
import { MS } from '@/components/gb/kit';
import { inr } from '@/components/gb/format';
import { downloadReceipt } from '@/components/gb/receipt';
import { useBackTo } from '@/lib/useBackTo';
import { directionsUrl, distanceLabel } from '@/components/gb/maps';
import { getSavedCoords } from '@/components/gb/location';

function stepIndex(s: GrabbitOrderStatus): number {
  const map: Record<GrabbitOrderStatus, number> = {
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
  useBackTo('/home'); // browser back matches the "Back to home" button
  const { clearCart } = useCart();
  const [order, setOrder] = useState<GrabbitOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // The order carries the cafe's name but not where it is, and there is no
  // single-cafe endpoint. The list is two rows today and the browser already has
  // it from the screens before this one.
  const [cafeGeo, setCafeGeo] = useState<{ name: string; address?: string | null; city?: string | null; latitude?: number | string | null; longitude?: number | string | null } | null>(null);
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    setMyCoords(getSavedCoords());
    if (!slug) return;
    let cancelled = false;
    fetch('/api/proxy/grabit/cafes')
      .then(r => (r.ok ? r.json() : []))
      .then((list: { slug: string; name: string; address?: string | null; city?: string | null; latitude?: number | string | null; longitude?: number | string | null }[]) => {
        if (!cancelled) setCafeGeo(list.find(c => c.slug === slug) ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  // Cashfree's returnUrl points here for EVERY checkout outcome - paid, failed, or
  // the customer cancelling/backing out - so arrival alone isn't proof of payment.
  // Only clear the cart once the order is confirmed actually placed (non-online
  // payment, or online + paid); a pending/failed/cancelled payment must leave the
  // cart intact so the customer can retry instead of re-adding everything.
  useEffect(() => {
    if (!order) return;
    if (order.payment_method === 'online' && order.payment_status !== 'paid') return;
    clearCart();
    sessionStorage.removeItem('grabbit_slot');
    sessionStorage.removeItem('grabbit_table');
    sessionStorage.removeItem('grabbit_notes');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

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

    // Mobile browsers throttle/suspend timers and the SSE connection while the tab
    // is backgrounded (screen locked, app-switched away) - exactly the window during
    // which the order is most likely to actually complete. Without this, a customer
    // reopening the tab keeps looking at whatever state it froze on until the next
    // tick fires, which may be a long time after they're already looking at the
    // screen. Force a reconcile the moment the page is visible again.
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(true); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);

    return () => {
      eventTypes.forEach(type => stream.removeEventListener(type, onEvent));
      stream.close();
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
    };
  }, [id, slug, router, token]);

  const center = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--gb-muted)', fontSize: 16, background: 'var(--gb-surface)' } as const;
  if (loading) return <div style={center}>Loading…</div>;
  if (denied) return <div style={center}>You don&apos;t have access to this order</div>;
  if (!order) return <div style={center}>Order not found</div>;

  // The cafe's own name, from the order. Title-casing the URL slug is a guess that reads
  // fine on screen and wrong on a receipt: "raydee" is not what the cafe calls itself. The
  // slug stays the fallback for an order placed before the name was synced.
  const cafeName = order.cafe_name
    || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'the café');
  const mapCafe = cafeGeo ?? { name: cafeName };
  const cafeDistance = distanceLabel(mapCafe, myCoords);
  // A delivery order has no pickup slot, and formatting null through Date() printed
  // "Invalid Date" in the header. The delivery block is the flag for the whole screen.
  const delivery = order.delivery ?? null;
  const pickupTime = order.pickup_slot
    ? new Date(order.pickup_slot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;
  const idx = stepIndex(order.status);
  const nodeState = (threshold: number): NodeState => idx > threshold ? 'done' : idx === threshold ? 'current' : 'upcoming';

  // Cashfree's returnUrl points straight at this page for EVERY checkout outcome -
  // paid, failed, or the customer backing out - so arrival here is not proof of
  // payment. Counter orders have no online payment step and start confirmed, so
  // only online orders need this gate; pending/failed here is the real order state
  // (see OrderService.create + PaymentReconciliationService), not a client guess.
  if (order.payment_method === 'online' && order.payment_status === 'failed') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 32 }}>
        <div style={{ background: 'linear-gradient(158deg,#9E2A2B 0%,#C13B3C 100%)', paddingTop: 'calc(32px + env(safe-area-inset-top))', paddingLeft: 20, paddingRight: 20, paddingBottom: 26, color: '#fff', textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <MS name="close" size={26} color="#fff" />
          </div>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 500, marginTop: 12 }}>Payment failed</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.82)', fontWeight: 500, marginTop: 3 }}>No charge was made · your order wasn&apos;t placed</div>
        </div>
        <button
          onClick={() => router.replace(`/${slug}/cart`)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: 'calc(100% - 32px)', margin: '16px 16px 0', border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', fontSize: 14.5, fontWeight: 800, padding: 13, borderRadius: 13, cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(177,90,50,.6)' }}
        >
          Retry payment<MS name="arrow_forward" size={17} />
        </button>
      </div>
    );
  }

  if (order.payment_method === 'online' && order.payment_status === 'pending') {
    return (
      <div style={{ minHeight: '100dvh', background: '#fff', paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'calc(14px + env(safe-area-inset-top)) 16px 12px', borderBottom: '1px solid var(--gb-line)' }}>
          <button
            onClick={() => setShowCancelConfirm(true)}
            aria-label="Cancel and go back"
            style={{ width: 32, height: 32, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gb-ink)' }}
          >
            <MS name="expand_more" size={24} />
          </button>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--gb-ink)' }}>Processing payment</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', padding: '0 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: 'var(--gb-muted)', fontWeight: 500, lineHeight: 1.5 }}>
            Please wait while your payment is being verified. You&apos;ll be redirected automatically.
          </p>
          <span className="gb-pulse-ring" style={{ display: 'inline-block', width: 34, height: 34, marginTop: 18, borderRadius: '50%', border: '3px solid var(--gb-line-3)', borderTopColor: 'var(--gb-primary)' }} />
        </div>

        {showCancelConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 22, width: '100%', maxWidth: 340 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gb-text)' }}>Confirmation</div>
              <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>
                Are you sure you want to cancel the transaction?
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{ flex: 1, border: '1.5px solid #EEE4D6', background: '#fff', color: 'var(--gb-ink)', fontSize: 14, fontWeight: 700, padding: 11, borderRadius: 11, cursor: 'pointer' }}
                >
                  No
                </button>
                <button
                  onClick={() => router.replace(`/${slug}/cart?cancelled=1`)}
                  style={{ flex: 1, border: 'none', background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', fontSize: 14, fontWeight: 700, padding: 11, borderRadius: 11, cursor: 'pointer' }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @keyframes gb-spin { to { transform: rotate(360deg); } }
          .gb-pulse-ring { animation: gb-spin .8s linear infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gb-track gb-wide-lg" style={{ minHeight: '100dvh', background: 'var(--gb-surface)', paddingBottom: 40 }}>
      {/* Where the order stands on the left, what is in it on the right, once
          there is room for both. One column on a phone. */}
      <div className="gb-track-cols">
      <div className="gb-track-status">
      {/* success header */}
      <div style={{ background: 'linear-gradient(158deg,#2A5238 0%,#38743F 100%)', paddingTop: 'calc(40px + env(safe-area-inset-top))', paddingLeft: 22, paddingRight: 22, paddingBottom: 30, color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <MS name="check_circle" size={36} fill color="#fff" />
        </div>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 14 }}>Order placed</div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.82)', fontWeight: 500, marginTop: 4 }}>
          {delivery
            ? delivery.status === 'failed'
              ? `${cafeName} could not complete this delivery`
              : delivery.status === 'delivered'
                ? `${cafeName} delivered your order`
                : `${cafeName} is delivering to you`
            : pickupTime ? `Pickup at ${cafeName} · ${pickupTime}` : `Order at ${cafeName}`}
        </div>
      </div>

      {/* where it is going (delivery), or the code to show at the counter (pickup) */}
      {delivery ? (
        <div style={{ margin: '-16px 16px 0', position: 'relative', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 18, boxShadow: 'var(--gb-shadow-pop)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gb-muted-2)' }}>Delivering to</div>
          <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
            <MS name="location_on" size={19} color="var(--gb-primary)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>
                {[delivery.line1, delivery.line2].filter(Boolean).join(', ')}
              </div>
              {delivery.landmark && (
                <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600, marginTop: 2 }}>{delivery.landmark}</div>
              )}
            </div>
          </div>
          {delivery.rider_name && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gb-line-2)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <MS name="sports_motorsports" size={19} color="var(--gb-primary)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gb-text)' }}>{delivery.rider_name} is bringing it</div>
                <div style={{ fontSize: 12, color: 'var(--gb-muted)', fontWeight: 600 }}>From {cafeName}</div>
              </div>
              {delivery.rider_phone && (
                <a href={`tel:${delivery.rider_phone}`} style={{ background: '#F4EBDF', color: 'var(--gb-primary)', width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MS name="call" size={19} />
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ margin: '-16px 16px 0', position: 'relative', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 20, padding: 20, boxShadow: 'var(--gb-shadow-pop)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gb-muted-2)' }}>Show this at the counter</div>
          <div className="gb-serif" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '.16em', color: 'var(--gb-primary)', marginTop: 6 }}>GB-{order.id}</div>
          <div style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 600 }}>Skip the queue, collect &amp; go</div>
        </div>
      )}

      {/* timeline */}
      <div style={{ margin: '20px 20px 0' }}>
        <TimelineNode state={nodeState(0)} icon="check" title="Order confirmed" sub={`${cafeName} got your order`} />
        <TimelineNode state={nodeState(1)} icon="restaurant" title="Preparing your order" sub="Barista is on it" />
        {delivery ? (
          <>
            {/* The leg has five states, not two: pending_assignment, assigned, picked_up,
                delivered, failed. Reading only the last two left an assigned rider
                showing as nothing happening, and a failed delivery showing as one still
                on its way, forever. */}
            <TimelineNode
              state={
                delivery.status === 'delivered' ? 'done'
                  : delivery.status === 'picked_up' || delivery.status === 'failed' ? 'current'
                  : delivery.status === 'assigned' ? 'current'
                  : 'upcoming'
              }
              icon="delivery_dining"
              title={delivery.status === 'assigned' ? 'Rider on the way to the cafe' : 'On the way'}
              sub={
                delivery.status === 'assigned'
                  ? delivery.rider_name ? `${delivery.rider_name} is collecting it` : 'A rider is heading to the cafe'
                  : delivery.rider_name ? `${delivery.rider_name} has your order` : 'A rider will pick it up from the cafe'
              }
            />
            {delivery.status === 'failed' ? (
              <TimelineNode
                state="current"
                icon="error"
                title="Delivery could not be completed"
                sub="The cafe will be in touch. Nothing more is charged."
                last
              />
            ) : (
              <TimelineNode
                state={delivery.status === 'delivered' ? 'done' : 'upcoming'}
                icon="home"
                title="Delivered"
                sub="Straight to your door"
                last
              />
            )}
          </>
        ) : (
          <TimelineNode state={idx >= 2 ? (idx >= 3 ? 'done' : 'current') : 'upcoming'} icon="shopping_bag" title="Ready for pickup" sub="We'll ping you, skip the queue" last />
        )}
      </div>

      </div>

      <div className="gb-track-detail">
      {/* café row */}
      <div style={{ margin: '4px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 15, display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=560&fit=crop&auto=format&q=72" alt={cafeName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>{cafeName}</div>
          <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', fontWeight: 600 }}>
            {delivery
              ? delivery.distance_km != null
                ? `${delivery.distance_km} km away · bringing it to you`
                : 'Bringing it to you'
              : cafeDistance ?? 'Tap for directions'}
          </div>
        </div>
        {/* Directions to the cafe help someone collecting. They are noise when the
            cafe is the one travelling. */}
        {!delivery && (
          <a
            href={directionsUrl(mapCafe)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Directions to ${cafeName}`}
            className="gb-press"
            style={{ background: '#F4EBDF', color: 'var(--gb-primary)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
          >
            <MS name="directions" size={22} />
          </a>
        )}
      </div>

      {/* order summary */}
      <div style={{ margin: '4px 16px 0', background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 15 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gb-muted-2)', marginBottom: 10 }}>Order summary</div>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gb-text)' }}>{item.quantity}× {item.menu_item_name}</div>
              {item.addons && item.addons.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--gb-muted-2)', marginTop: 1 }}>+ {item.addons.map((a) => a.name).join(', ')}</div>
              )}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gb-text)', flex: 'none' }}>{inr(item.unit_price * item.quantity + (item.addons_total ?? 0))}</div>
          </div>
        ))}
        {delivery && delivery.charge != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gb-muted)' }}>Delivery</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gb-muted)' }}>{inr(delivery.charge)}</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gb-line-2)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>Total paid</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{inr(order.total_amount)}</div>
        </div>
      </div>

      {/* receipt */}
      <button
        onClick={() => downloadReceipt(order, cafeName)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: 'calc(100% - 32px)', margin: '12px 16px 0', border: '1px solid #E7DCCC', background: '#fff', color: 'var(--gb-ink)', fontSize: 14.5, fontWeight: 700, padding: 13, borderRadius: 14, cursor: 'pointer' }}
      >
        <MS name="receipt_long" size={18} />Download receipt
      </button>

      {/* back to home */}
      <button onClick={() => router.replace('/home')} style={{ width: 'calc(100% - 32px)', margin: '12px 16px 0', border: '1px solid #E7DCCC', background: '#fff', color: 'var(--gb-ink)', fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 14, textAlign: 'center', cursor: 'pointer' }}>
        Back to home
      </button>
      </div>
      </div>
    </div>
  );
}
