'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCafeId } from '../CafeProvider';
import { StaffChrome, Button, Icon } from '@/components/ui/kit';
import type { GrabbitOrderWithItems } from '@gradient365/gradient-commons';

/** Kanban columns mapped to real order statuses (completed/cancelled are filtered out). */
const COLS: { status: string; title: string; accent: string }[] = [
  { status: 'new_order', title: 'New',      accent: 'var(--info)' },
  { status: 'confirmed', title: 'Accepted', accent: 'var(--success)' },
  { status: 'prepping',  title: 'Prepping', accent: 'var(--tertiary)' },
  { status: 'ready',     title: 'Ready',    accent: 'var(--primary)' },
];

const STATUS_ACTIONS: Record<string, { label: string; next: string; variant: 'primary' | 'success' | 'dark' }> = {
  confirmed: { label: 'Start Prepping', next: 'prepping',  variant: 'primary' },
  prepping:  { label: 'Mark Ready',     next: 'ready',     variant: 'success' },
  ready:     { label: 'Hand Over',      next: 'completed', variant: 'dark' },
};

function minsUntil(isoSlot: string): number {
  return Math.round((new Date(isoSlot).getTime() - Date.now()) / 60000);
}

function minsSince(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000);
}

/**
 * An online order sits in `pending` until Cashfree confirms payment, and `pending`
 * matches no kanban column, so until now these were invisible to staff. A customer
 * whose payment did not confirm had no way to be seen except to complain.
 *
 * Shown from 3 minutes (below that they are simply still at the payment screen)
 * until 45, past which the order has expired and reconciliation has settled it.
 */
const UNCONFIRMED_MIN_AGE_MINS = 3;
const UNCONFIRMED_MAX_AGE_MINS = 45;

function isAwaitingPayment(o: GrabbitOrderWithItems): boolean {
  if (o.status !== 'pending' || o.payment_status !== 'pending') return false;
  if (o.payment_method !== 'online') return false;
  const age = minsSince(o.created_at);
  return age >= UNCONFIRMED_MIN_AGE_MINS && age <= UNCONFIRMED_MAX_AGE_MINS;
}

export default function ManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const cafeId = useCafeId();
  const [orders, setOrders] = useState<GrabbitOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState<number | null>(null);
  const [recheckResult, setRecheckResult] = useState<{ orderId: number; status: string } | null>(null);
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);

  const loadOrders = useCallback(async (cid: number) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const r = await fetch(`/api/proxy/grabit/orders/cafe/${cid}?date=${today}`);
      const data = await r.json();
      setOrders(Array.isArray(data)
        ? data.filter((o: GrabbitOrderWithItems) => !['completed', 'cancelled'].includes(o.status))
        : []);
    } catch {
      // keep existing orders on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cafeId) return;
    loadOrders(cafeId);
  }, [cafeId, loadOrders]);

  useEffect(() => {
    if (!cafeId) return;
    const stream = new EventSource(`/api/stream/grabit/orders/cafe/${cafeId}`);
    const refresh = () => { loadOrders(cafeId); };
    const eventTypes = [
      'ORDER_CREATED',
      'PAYMENT_CAPTURED',
      'ORDER_CONFIRMED',
      'ORDER_PREPPING',
      'ORDER_READY',
      'ORDER_COMPLETED',
      'ORDER_STATUS_CHANGED',
    ];
    eventTypes.forEach(type => stream.addEventListener(type, refresh));
    // Do NOT close() on error: native EventSource auto-reconnects with backoff and
    // resends Last-Event-ID (server replays missed events). Closing here would kill
    // that and silently degrade to polling. On reconnect, refetch to reconcile.
    stream.onerror = () => { refresh(); };

    // Reconciliation remains the source of correctness after reconnects/deploys.
    const poll = setInterval(refresh, 60000);
    return () => {
      eventTypes.forEach(type => stream.removeEventListener(type, refresh));
      stream.close();
      clearInterval(poll);
    };
  }, [cafeId, loadOrders]);

  const updateStatus = useCallback(async (orderId: number, nextStatus: string, prepMins?: number) => {
    const body: Record<string, unknown> = { status: nextStatus };
    if (prepMins) body.prep_time_minutes = prepMins;
    await fetch(`/api/proxy/grabit/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (cafeId) await loadOrders(cafeId);
  }, [cafeId, loadOrders]);

  const recheckPayment = useCallback(async (orderId: number) => {
    setRechecking(orderId);
    try {
      const r = await fetch(`/api/proxy/grabit/orders/${orderId}/recheck-payment`, { method: 'POST' });
      const data = await r.json().catch(() => ({}));
      // Whatever the gateway says is the answer. "still not paid" is as useful to
      // staff as "now paid": it means the money genuinely has not arrived, rather
      // than leaving them to judge a screenshot.
      setRecheckResult({ orderId, status: data?.payment_status ?? 'unknown' });
      if (cafeId) await loadOrders(cafeId);
    } catch {
      setRecheckResult({ orderId, status: 'error' });
    } finally {
      setRechecking(null);
    }
  }, [cafeId, loadOrders]);

  const awaitingPayment = orders.filter(isAwaitingPayment);
  const newCount = orders.filter(o => o.status === 'new_order').length;

  return (
    <StaffChrome
      slug={slug}
      active="queue"
      title="Live Order Queue"
      sub={`${orders.length} active`}
      newCount={newCount}
      right={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {awaitingPayment.length > 0 && (
            <button
              type="button"
              onClick={() => setShowUnconfirmed(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-pill)', background: 'var(--warning-tint, #fff7ed)', color: 'var(--warning, #b45309)', fontSize: 13, fontWeight: 700 }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning, #b45309)' }} />
              {awaitingPayment.length} unconfirmed
            </button>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 'var(--r-pill)', background: 'var(--success-tint)', color: 'var(--success)', fontSize: 13, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'blink 1.5s ease-in-out infinite' }} />
            Live
          </span>
        </span>
      }
    >
      <style>{`
        .gb-queue-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 16px; }
        @media (min-width: 1024px) {
          .gb-queue-grid { grid-template-columns: repeat(4, 1fr); padding: 20px; align-items: start; }
        }
      `}</style>

      {loading && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Loading…</p>}

      {!loading && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-tint)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>{Icon.check({ size: 28 })}</div>
          <p className="t-title" style={{ fontSize: 18 }}>All clear</p>
          <p className="t-caption" style={{ marginTop: 4 }}>No active orders right now</p>
        </div>
      )}

      {showUnconfirmed && (
        <div
          onClick={() => setShowUnconfirmed(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(560px, 100%)', maxHeight: '80dvh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--warning, #b45309)' }} />
              <span className="t-label" style={{ fontSize: 15 }}>Payment unconfirmed</span>
              <span style={{ marginLeft: 'auto' }}>
                <Button variant="dark" onClick={() => setShowUnconfirmed(false)}>Close</Button>
              </span>
            </div>

            <p className="t-caption" style={{ padding: '10px 16px 0' }}>
              These customers started paying but the gateway has not confirmed. Ask to see
              their confirmation, then re-check. Their bank saying paid is not proof the
              money reached us.
            </p>

            {awaitingPayment.length === 0 && (
              <p className="t-caption" style={{ padding: '16px' }}>Nothing unconfirmed right now.</p>
            )}

            {awaitingPayment.map(order => {
              const result = recheckResult?.orderId === order.id ? recheckResult.status : null;
              return (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderTop: '1px solid var(--hairline)' }}>
                  <span className="tabular t-label" style={{ fontSize: 15 }}>#{order.id}</span>
                  <span style={{ fontSize: 14 }}>{order.customer_name ?? 'Guest'}</span>
                  <span className="tabular" style={{ fontSize: 14, fontWeight: 700 }}>₹{order.total_amount}</span>
                  <span className="t-caption">waiting {minsSince(order.created_at)}m</span>

                  {result && (
                    <span className="t-caption" style={{ width: '100%', fontWeight: 700, color: result === 'paid' ? 'var(--success)' : 'var(--error)' }}>
                      {result === 'paid'
                        ? 'Payment confirmed, order released to the board'
                        : result === 'error'
                          ? 'Could not reach the payment gateway, try again'
                          : 'Gateway still reports no payment received'}
                    </span>
                  )}

                  <span style={{ marginLeft: 'auto' }}>
                    <Button
                      variant="primary"
                      disabled={rechecking === order.id}
                      onClick={() => recheckPayment(order.id)}
                    >
                      {rechecking === order.id ? 'Checking…' : 'Re-check payment'}
                    </Button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="gb-queue-grid">
          {COLS.map(col => {
            const cards = orders.filter(o => o.status === col.status);
            return (
              <div key={col.status} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-low)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--hairline)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: col.accent }} />
                  <span className="t-label" style={{ fontSize: 14 }}>{col.title}</span>
                  <span className="tabular" style={{ marginLeft: 'auto', minWidth: 22, height: 22, padding: '0 6px', borderRadius: 11, background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: 12.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{cards.length}</span>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cards.length === 0 && <div className="t-caption" style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--muted-2)' }}>No orders</div>}
                  {cards.map(order => (
                    <QueueCard
                      key={order.id}
                      order={order}
                      onReject={() => updateStatus(order.id, 'cancelled')}
                      onAccept={(prepMins) => updateStatus(order.id, 'confirmed', prepMins)}
                      onAdvance={() => updateStatus(order.id, STATUS_ACTIONS[order.status].next)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StaffChrome>
  );
}

function QueueCard({
  order, onReject, onAccept, onAdvance,
}: {
  order: GrabbitOrderWithItems;
  onReject: () => void;
  onAccept: (prepMins: number) => void;
  onAdvance: () => void;
}) {
  const isNew = order.status === 'new_order';
  // Chef times from the menu give a starting number, so accepting is one tap and
  // adjusting is a nudge, not a calculation.
  const [prepMins, setPrepMins] = useState(order.suggested_prep_minutes ?? 10);
  const startBy = new Date(new Date(order.pickup_slot).getTime() - prepMins * 60000);
  const startsLate = startBy.getTime() <= Date.now();
  const mins = minsUntil(order.pickup_slot);
  const overdue = mins < 0;
  const dueText = overdue ? `Overdue ${Math.abs(mins)}m` : mins === 0 ? 'Due now' : `Due in ${mins}m`;

  const hasTimer = order.status === 'prepping' && order.prep_ready_at;
  const prepMinsLeft = hasTimer
    ? Math.max(0, Math.round((new Date(order.prep_ready_at!).getTime() - Date.now()) / 60000))
    : null;
  const etaMins = order.eta_minutes ?? null;
  const paid = order.payment_status === 'paid';
  const action = STATUS_ACTIONS[order.status];

  return (
    <div style={{
      background: 'var(--surface-card)', borderRadius: 'var(--r-md)',
      border: `1px solid ${isNew ? 'var(--info)' : 'var(--hairline)'}`,
      boxShadow: 'var(--shadow-card)', padding: 13,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="tabular t-label" style={{ fontSize: 15 }}>#{order.id}</span>
        <span className="tabular" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
          color: overdue ? 'var(--error)' : order.status === 'ready' ? 'var(--success)' : 'var(--on-surface-variant)',
          background: overdue ? 'var(--error-tint)' : 'var(--surface-container)', padding: '3px 8px', borderRadius: 'var(--r-pill)',
        }}>
          {Icon.clock({ size: 13 })} {dueText}
          {etaMins !== null && ` · ETA ${etaMins}m`}
          {prepMinsLeft !== null && ` · ${prepMinsLeft}m left`}
        </span>
      </div>

      {/* Customer */}
      <div className="t-caption" style={{ marginBottom: 9 }}>
        {order.customer_name ? `${order.customer_name} · ` : ''}{order.customer_phone}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 11, padding: '9px 10px', background: 'var(--surface-low)', borderRadius: 'var(--r-sm)' }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="tabular" style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--muted)', minWidth: 20 }}>{item.quantity}×</span>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.menu_item_name}</span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 27 }}>
                + {item.addons.map((a) => a.name).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Customer instructions — only when present */}
      {order.notes && (
        <div style={{ display: 'flex', gap: 7, marginBottom: 11, padding: '9px 10px', background: 'var(--warning-tint)', borderRadius: 'var(--r-sm)' }}>
          {Icon.edit({ size: 14 })}
          <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{order.notes}</span>
        </div>
      )}

      {/* Prep estimate — only while deciding; after accept the timer takes over */}
      {isNew && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11, padding: '9px 10px', background: 'var(--surface-low)', borderRadius: 'var(--r-sm)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-caption" style={{ fontWeight: 700, color: 'var(--on-surface-variant)' }}>Prep time</div>
            <div className="t-caption" style={{ color: startsLate ? 'var(--error)' : 'var(--muted)' }}>
              {startsLate ? 'Start now to make the slot' : `Start by ${startBy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)', padding: 2 }}>
            <button
              onClick={() => setPrepMins((m) => Math.max(1, m - 5))}
              aria-label="Less prep time"
              style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >−</button>
            <span className="tabular" style={{ minWidth: 44, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{prepMins}m</span>
            <button
              onClick={() => setPrepMins((m) => Math.min(120, m + 5))}
              aria-label="More prep time"
              style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >+</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{
          padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap',
          background: paid ? 'var(--success-tint)' : 'var(--primary-tint)',
          color: paid ? 'var(--success)' : 'var(--primary)',
        }}>
          {paid ? 'Paid' : 'Unpaid'} · ₹{Number(order.total_amount).toFixed(0)}
        </span>

        {isNew && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
            <Button size="sm" variant="success" onClick={() => onAccept(prepMins)}>Accept</Button>
          </div>
        )}
        {!isNew && action && (
          <Button size="sm" variant={action.variant} onClick={onAdvance}>{action.label}</Button>
        )}
      </div>
    </div>
  );
}
